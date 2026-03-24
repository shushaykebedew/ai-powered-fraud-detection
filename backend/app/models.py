"""
Pydantic models for request/response validation
"""
from typing import List, Dict, Any
from pydantic import BaseModel, Field, validator

class TransactionData(BaseModel):
    """
    Transaction data model for API input validation
    """
    step: int = Field(1, description="Step (Hour) of transaction")
    type: str = Field(..., description="Type of transaction (CASH_IN, CASH_OUT, DEBIT, PAYMENT, TRANSFER)")
    amount: float = Field(..., gt=0, description="Transaction amount")
    oldbalance_org: float = Field(..., ge=0, description="Original balance before transaction")
    newbalance_orig: float = Field(..., ge=0, description="Original balance after transaction")
    oldbalance_dest: float = Field(..., ge=0, description="Destination balance before transaction")
    newbalance_dest: float = Field(..., ge=0, description="Destination balance after transaction")
    
    @validator('type')
    def validate_type(cls, v):
        valid_types = ['CASH_IN', 'CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER']
        if v.upper() not in valid_types:
            raise ValueError(f'Invalid transaction type. Must be one of: {valid_types}')
        return v.upper()

class PredictionResponse(BaseModel):
    """Response model for fraud prediction"""
    is_fraud: bool = Field(..., description="Whether transaction is predicted as fraud")
    fraud_probability: float = Field(..., ge=0, le=1, description="Probability of fraud (0-1)")
    risk_level: str = Field(..., description="Risk level: Low, Medium, or High")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence score")
    message: str = Field(..., description="Human-readable prediction message")
    recommendations: List[str] = Field(..., description="Recommended actions")
    model_version: str = Field(..., description="Version of the model used")

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    model_loaded: bool
    scaler_loaded: bool
    model_info: Dict[str, Any]
    api_version: str

class BatchPredictionRequest(BaseModel):
    """Batch prediction request model"""
    transactions: List[TransactionData] = Field(..., max_items=100)

class BatchPredictionResponse(BaseModel):
    """Batch prediction response model"""
    batch_results: List[Dict[str, Any]]
    total_processed: int
    success_count: int
    error_count: int