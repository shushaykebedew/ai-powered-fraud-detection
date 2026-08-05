from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.services.ml_service import MLService, get_ml_service

router = APIRouter(prefix="/stats", tags=["Dashboard"])


@router.get("/model-performance")
def model_performance(ml: MLService = Depends(get_ml_service)):
    """Returns the offline evaluation metrics captured at training time
    (see notebook section 11 — Production Export)."""
    meta = ml.metadata
    return {
        "model_version": meta.get("model_version"),
        "model_type": meta.get("model_type"),
        "decision_threshold": meta.get("decision_threshold"),
        "test_metrics": meta.get("test_metrics"),
        "training_rows": meta.get("training_rows"),
        "fraud_rate_train": meta.get("fraud_rate_train"),
    }


@router.get("/summary")
def prediction_summary(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    base = db.query(Prediction).filter(
        Prediction.user_id == current_user.id, Prediction.created_at >= since
    )

    total = base.count()
    fraud_count = base.filter(Prediction.is_fraud_predicted.is_(True)).count()
    avg_risk = base.with_entities(func.avg(Prediction.risk_score)).scalar() or 0.0

    rows = base.with_entities(Prediction.created_at, Prediction.is_fraud_predicted).all()
    daily_map: dict[str, dict[str, int]] = {}
    for created_at, is_fraud in rows:
        day_key = created_at.date().isoformat()
        bucket = daily_map.setdefault(day_key, {"total": 0, "fraud": 0})
        bucket["total"] += 1
        bucket["fraud"] += int(bool(is_fraud))
    daily_breakdown = [
        {"date": day, "total": v["total"], "fraud": v["fraud"]}
        for day, v in sorted(daily_map.items())
    ]

    return {
        "period_days": days,
        "total_predictions": total,
        "fraud_flagged": fraud_count,
        "fraud_rate": round(fraud_count / total, 4) if total else 0.0,
        "average_risk_score": round(float(avg_risk), 4),
        "daily_breakdown": daily_breakdown,
    }
