import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import shap

from app.core.config import settings
from app.core.logging import logger


class MLService:
    """
    Loads the trained model + scaler + metadata exported by the notebook
    (see fraud_detection_v2.ipynb, section 11 — Production Export) and
    serves fraud predictions with SHAP-based explanations.

    Feature engineering here MUST stay in sync with `engineer_features()`
    in the notebook — it is intentionally duplicated (not imported) so the
    API has no runtime dependency on the notebook.
    """

    def __init__(self, model_dir: str | None = None):
        self.model_dir = Path(model_dir or settings.MODEL_DIR)
        self._model = None
        self._scaler = None
        self._metadata: dict[str, Any] = {}
        self._explainer = None
        self._load()

    def _load(self) -> None:
        model_path = self.model_dir / "model.joblib"
        scaler_path = self.model_dir / "scaler.joblib"
        meta_path = self.model_dir / "metadata.json"

        if not (model_path.exists() and scaler_path.exists() and meta_path.exists()):
            raise FileNotFoundError(
                f"Model artifacts not found in {self.model_dir}. "
                f"Expected model.joblib, scaler.joblib, metadata.json — "
                f"export these from the training notebook first."
            )

        self._model = joblib.load(model_path)
        self._scaler = joblib.load(scaler_path)
        with open(meta_path) as f:
            self._metadata = json.load(f)
        self._explainer = shap.TreeExplainer(self._model)
        logger.info(
            "Loaded model version %s from %s", self._metadata.get("model_version"), self.model_dir
        )

    @property
    def metadata(self) -> dict[str, Any]:
        return self._metadata

    def _engineer_features(self, tx: dict) -> pd.DataFrame:
        """Mirrors notebook section 4 (Feature Engineering) for a single transaction."""
        step = tx["step"]
        amount = tx["amount"]
        old_orig = tx["oldbalance_org"]
        new_orig = tx["newbalance_orig"]
        old_dest = tx["oldbalance_dest"]
        new_dest = tx["newbalance_dest"]

        row = {
            "step_hour_of_day": step % 24,
            "step_day": step // 24,
            "type": tx["type"],
            "log_amount": float(np.log1p(amount)),
            "amount": amount,
            "oldbalance_org": old_orig,
            "newbalance_orig": new_orig,
            "oldbalance_dest": old_dest,
            "newbalance_dest": new_dest,
            "diff_new_old_balance": new_orig - old_orig,
            "diff_new_old_destiny": new_dest - old_dest,
            "balance_error_orig": old_orig - amount - new_orig,
            "balance_error_dest": old_dest + amount - new_dest,
            "orig_emptied": int(old_orig > 0 and new_orig == 0),
            "is_merchant_dest": int(str(tx["name_dest"]).startswith("M")),
        }
        return pd.DataFrame([row])

    def _encode_and_scale(self, raw_df: pd.DataFrame) -> pd.DataFrame:
        categorical_cols = self._metadata["categorical_cols"]
        numeric_cols = self._metadata["numeric_cols"]
        feature_schema = self._metadata["feature_schema"]

        encoded = pd.get_dummies(raw_df, columns=categorical_cols)
        encoded = encoded.reindex(columns=feature_schema, fill_value=0)
        encoded[numeric_cols] = self._scaler.transform(encoded[numeric_cols])
        return encoded

    def predict(self, tx: dict) -> dict:
        raw_df = self._engineer_features(tx)
        encoded = self._encode_and_scale(raw_df)

        proba = float(self._model.predict_proba(encoded)[0, 1])
        threshold = self._metadata["decision_threshold"]
        is_fraud = proba >= threshold

        if proba < threshold * 0.5:
            risk_level = "low"
        elif proba < threshold:
            risk_level = "medium"
        else:
            risk_level = "high"

        top_factors = self._explain(encoded)

        return {
            "risk_score": round(proba, 6),
            "is_fraud_predicted": bool(is_fraud),
            "risk_level": risk_level,
            "model_version": self._metadata["model_version"],
            "top_factors": top_factors,
        }

    def _explain(self, encoded_row: pd.DataFrame, top_n: int = 5) -> list[dict]:
        shap_values = self._explainer.shap_values(encoded_row)
        values = shap_values[0] if isinstance(shap_values, list) else shap_values[0]
        contributions = list(zip(encoded_row.columns, np.ravel(values)))
        contributions.sort(key=lambda x: abs(x[1]), reverse=True)

        return [
            {
                "feature": feat,
                "contribution": round(float(val), 6),
                "direction": "increases_risk" if val > 0 else "decreases_risk",
            }
            for feat, val in contributions[:top_n]
        ]


# module-level singleton, loaded once at app startup (see app/main.py)
ml_service: MLService | None = None


def get_ml_service() -> MLService:
    global ml_service
    if ml_service is None:
        ml_service = MLService()
    return ml_service
