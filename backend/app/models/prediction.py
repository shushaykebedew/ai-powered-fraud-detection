import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)

    # raw transaction input, kept for audit/reproducibility
    transaction_input: Mapped[dict] = mapped_column(JSON, nullable=False)

    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    is_fraud_predicted: Mapped[bool] = mapped_column(Boolean, nullable=False)
    model_version: Mapped[str] = mapped_column(String, nullable=False)
    top_factors: Mapped[list] = mapped_column(JSON, nullable=False)  # SHAP explanation

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )
