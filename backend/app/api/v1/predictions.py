import io

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.limiter import limiter
from app.db.base import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import (
    BatchPredictionResponse,
    BatchRowResult,
    PredictionHistoryPage,
    PredictionResult,
    TransactionInput,
)
from app.services.ml_service import MLService, get_ml_service

router = APIRouter(prefix="/predictions", tags=["Predictions"])

MAX_BATCH_ROWS = 1000
REQUIRED_BATCH_COLUMNS = [
    "step", "type", "amount", "name_orig", "oldbalance_org",
    "newbalance_orig", "name_dest", "oldbalance_dest", "newbalance_dest",
]


def _score_and_save(
    payload: TransactionInput, db: Session, current_user: User, ml: MLService
) -> tuple[dict, Prediction]:
    result = ml.predict(payload.model_dump())
    record = Prediction(
        user_id=current_user.id,
        transaction_input=payload.model_dump(mode="json"),
        risk_score=result["risk_score"],
        is_fraud_predicted=result["is_fraud_predicted"],
        model_version=result["model_version"],
        top_factors=result["top_factors"],
    )
    db.add(record)
    return result, record


@router.post("/predict", response_model=PredictionResult)
@limiter.limit("60/minute")
def predict_transaction(
    request: Request,
    payload: TransactionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ml: MLService = Depends(get_ml_service),
):
    result, record = _score_and_save(payload, db, current_user, ml)
    db.commit()
    db.refresh(record)

    return PredictionResult(
        id=record.id,
        risk_score=result["risk_score"],
        is_fraud_predicted=result["is_fraud_predicted"],
        risk_level=result["risk_level"],
        model_version=result["model_version"],
        top_factors=result["top_factors"],
        created_at=record.created_at,
    )


@router.post("/batch", response_model=BatchPredictionResponse)
@limiter.limit("5/minute")
def predict_batch(
    request: Request,
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ml: MLService = Depends(get_ml_service),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a .csv file")

    raw = file.file.read()
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {exc}")

    missing = [c for c in REQUIRED_BATCH_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"CSV is missing required columns: {', '.join(missing)}",
        )

    if len(df) > MAX_BATCH_ROWS:
        raise HTTPException(
            status_code=400,
            detail=f"Batch too large — max {MAX_BATCH_ROWS} rows per upload, got {len(df)}",
        )

    results: list[BatchRowResult] = []
    fraud_flagged = 0
    failed = 0

    for idx, row in df.iterrows():
        row_num = int(idx) + 1
        try:
            payload = TransactionInput(**row[REQUIRED_BATCH_COLUMNS].to_dict())
        except ValidationError as exc:
            failed += 1
            results.append(
                BatchRowResult(row=row_num, status="error", error=str(exc.errors()[0]["msg"]))
            )
            continue

        try:
            result, record = _score_and_save(payload, db, current_user, ml)
        except Exception as exc:
            failed += 1
            results.append(BatchRowResult(row=row_num, status="error", error=str(exc)))
            continue

        db.flush()  # assign record.id without committing yet
        if result["is_fraud_predicted"]:
            fraud_flagged += 1
        results.append(
            BatchRowResult(
                row=row_num,
                status="scored",
                risk_score=result["risk_score"],
                is_fraud_predicted=result["is_fraud_predicted"],
                risk_level=result["risk_level"],
                prediction_id=record.id,
            )
        )

    db.commit()

    return BatchPredictionResponse(
        total_rows=len(df),
        scored=len(df) - failed,
        failed=failed,
        fraud_flagged=fraud_flagged,
        results=results,
    )


@router.get("/history", response_model=PredictionHistoryPage)
def get_prediction_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    fraud_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    if fraud_only:
        query = query.filter(Prediction.is_fraud_predicted.is_(True))

    total = query.count()
    items = (
        query.order_by(Prediction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PredictionHistoryPage(items=items, total=total, page=page, page_size=page_size)


@router.get("/{prediction_id}", response_model=PredictionResult)
def get_prediction(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id, Prediction.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    risk_level = (
        "high" if record.risk_score >= 0.5 else "medium" if record.risk_score >= 0.2 else "low"
    )
    return PredictionResult(
        id=record.id,
        risk_score=record.risk_score,
        is_fraud_predicted=record.is_fraud_predicted,
        risk_level=risk_level,
        model_version=record.model_version,
        top_factors=record.top_factors,
        created_at=record.created_at,
    )
