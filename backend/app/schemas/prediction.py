from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TransactionType(str, Enum):
    CASH_IN = "CASH_IN"
    CASH_OUT = "CASH_OUT"
    DEBIT = "DEBIT"
    PAYMENT = "PAYMENT"
    TRANSFER = "TRANSFER"


class TransactionInput(BaseModel):
    """Raw transaction fields — mirrors the PaySim schema the model was trained on."""

    step: int = Field(..., ge=0, description="Hours since simulation start")
    type: TransactionType
    amount: float = Field(..., ge=0)
    name_orig: str = Field(..., min_length=1, max_length=64)
    oldbalance_org: float = Field(..., ge=0)
    newbalance_orig: float = Field(..., ge=0)
    name_dest: str = Field(..., min_length=1, max_length=64)
    oldbalance_dest: float = Field(..., ge=0)
    newbalance_dest: float = Field(..., ge=0)

    @field_validator("name_orig", "name_dest")
    @classmethod
    def must_start_with_c_or_m(cls, v: str) -> str:
        if not v[0] in ("C", "M"):
            raise ValueError("account identifiers must start with 'C' (customer) or 'M' (merchant)")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "step": 12,
                "type": "TRANSFER",
                "amount": 181000.00,
                "name_orig": "C1231006815",
                "oldbalance_org": 181000.00,
                "newbalance_orig": 0.00,
                "name_dest": "C1666544295",
                "oldbalance_dest": 0.00,
                "newbalance_dest": 0.00,
            }
        }


class RiskFactor(BaseModel):
    feature: str
    contribution: float
    direction: str  # "increases_risk" | "decreases_risk"


class PredictionResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=(), from_attributes=True)

    id: str
    risk_score: float = Field(..., description="Fraud probability, 0-1")
    is_fraud_predicted: bool
    risk_level: str  # "low" | "medium" | "high"
    model_version: str
    top_factors: list[RiskFactor]
    created_at: datetime


class PredictionHistoryItem(BaseModel):
    model_config = ConfigDict(protected_namespaces=(), from_attributes=True)

    id: str
    risk_score: float
    is_fraud_predicted: bool
    model_version: str
    created_at: datetime
    transaction_input: dict


class BatchRowResult(BaseModel):
    row: int
    status: str  # "scored" | "error"
    error: Optional[str] = None
    risk_score: Optional[float] = None
    is_fraud_predicted: Optional[bool] = None
    risk_level: Optional[str] = None
    prediction_id: Optional[str] = None


class BatchPredictionResponse(BaseModel):
    total_rows: int
    scored: int
    failed: int
    fraud_flagged: int
    results: list[BatchRowResult]


class PredictionHistoryPage(BaseModel):
    items: list[PredictionHistoryItem]
    total: int
    page: int
    page_size: int
