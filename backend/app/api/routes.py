"""
API routes for fraud detection
"""
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status

from ..models import (
    TransactionData, 
    PredictionResponse, 
    HealthResponse,
    BatchPredictionRequest,
    BatchPredictionResponse
)
from ..ml_service import ml_service
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", tags=["General"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Fraud Detection API",
        "status": "operational",
        "version": settings.API_VERSION,
        "docs": "/docs",
        "health": "/health"
    }

@router.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """Comprehensive health check endpoint"""
    return HealthResponse(
        status="healthy" if ml_service.is_loaded else "unhealthy",
        model_loaded=ml_service.model is not None,
        scaler_loaded=ml_service.scaler is not None,
        model_info=ml_service.model_info,
        api_version=settings.API_VERSION
    )

@router.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_fraud(transaction: TransactionData):
    """
    Predict fraud for a given transaction
    
    Returns detailed prediction including probability, risk level, and recommendations
    """
    try:
        if not ml_service.is_loaded:
            logger.error("ML service not loaded")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model not available. Please try again later."
            )
        
        # Log incoming request (without sensitive data)
        logger.info(f"Processing fraud prediction: amount=${transaction.amount}, "
                   f"type={transaction.type}")
        
        # Make prediction
        result = ml_service.predict(transaction)
        
        # Log result
        logger.info(f"Prediction completed: fraud={result['is_fraud']}, "
                   f"probability={result['fraud_probability']:.3f}")
        
        return PredictionResponse(**result)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Prediction"])
async def predict_batch(request: BatchPredictionRequest):
    """Batch prediction endpoint for multiple transactions"""
    if len(request.transactions) > settings.MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {settings.MAX_BATCH_SIZE} transactions per batch"
        )
    
    results = []
    success_count = 0
    error_count = 0
    
    for i, transaction in enumerate(request.transactions):
        try:
            result = ml_service.predict(transaction)
            results.append({"index": i, "prediction": result})
            success_count += 1
        except Exception as e:
            results.append({"index": i, "error": str(e)})
            error_count += 1
    
    return BatchPredictionResponse(
        batch_results=results,
        total_processed=len(results),
        success_count=success_count,
        error_count=error_count
    )

@router.get("/model-info", tags=["Model"])
async def get_model_info():
    """Get comprehensive information about the loaded model"""
    if not ml_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded"
        )
    
    return {
        "model_info": ml_service.model_info,
        "api_version": settings.API_VERSION,
        "feature_names": [
            "step", "oldbalance_org", "newbalance_orig", "newbalance_dest", 
            "diff_new_old_balance", "diff_new_old_destiny", "type_TRANSFER"
        ],
        "transaction_types": ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"],
        "risk_thresholds": {
            "low": f"< {settings.FRAUD_THRESHOLDS['low']*100:.0f}%",
            "medium": f"{settings.FRAUD_THRESHOLDS['low']*100:.0f}% - {settings.FRAUD_THRESHOLDS['medium']*100:.0f}%", 
            "high": f"> {settings.FRAUD_THRESHOLDS['medium']*100:.0f}%"
        }
    }

@router.get("/stats", tags=["General"])
async def get_api_stats():
    """Get API usage statistics"""
    return {
        "status": "operational",
        "model_loaded": ml_service.is_loaded,
        "uptime": "Available since startup",
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT
    }