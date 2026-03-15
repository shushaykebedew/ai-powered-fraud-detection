"""
Pydantic models for request/response validation
"""
from typing import List, Dict, Any
from pydantic import BaseModel, Field, validator

class TransactionData(BaseModel):
    """
    Transaction data model for API input validation
    """
    amount: float = Field(..., gt=0, le=1000000, description="Transaction amount in USD")
    merchant_category: str = Field(..., description="Merchant category")
    transaction_type: str = Field(..., description="Type of transaction")
    hour: int = Field(..., ge=0, le=23, description="Hour of transaction (0-23)")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    is_weekend: bool = Field(..., description="Whether transaction occurs on weekend")
    customer_age: int = Field(..., ge=18, le=120, description="Customer age in years")
    account_balance: float = Field(..., ge=0, le=10000000, description="Account balance in USD")
    
    @validator('merchant_category')
    def validate_merchant_category(cls, v):
        valid_categories = ['grocery', 'gas', 'restaurant', 'retail', 'online', 'other']
        if v.lower() not in valid_categories:
            raise ValueError(f'Invalid merchant category. Must be one of: {valid_categories}')
        return v.lower()
    
    @validator('transaction_type')
    def validate_transaction_type(cls, v):
        valid_types = ['debit', 'credit', 'transfer', 'withdrawal']
        if v.lower() not in valid_types:
            raise ValueError(f'Invalid transaction type. Must be one of: {valid_types}')
        return v.lower()
    
    @validator('day_of_week')
    def validate_day_of_week(cls, v):
        if v < 0 or v > 6:
            raise ValueError('Day of week must be between 0 (Monday) and 6 (Sunday)')
        return v

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