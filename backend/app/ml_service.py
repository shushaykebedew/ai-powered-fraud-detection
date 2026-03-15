"""
Machine Learning service for fraud detection
"""
import logging
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

from .config import settings
from .models import TransactionData

logger = logging.getLogger(__name__)

class MLService:
    """Machine Learning service for fraud detection"""
    
    def __init__(self):
        self.model: Optional[RandomForestClassifier] = None
        self.scaler: Optional[MinMaxScaler] = None
        self.model_info: Dict[str, Any] = {}
        self.is_loaded = False
    
    def load_model(self) -> bool:
        """Load the trained model and scaler"""
        try:
            if settings.MODEL_PATH.exists() and settings.SCALER_PATH.exists():
                logger.info("Loading existing model and scaler...")
                self.model = joblib.load(settings.MODEL_PATH)
                self.scaler = joblib.load(settings.SCALER_PATH)
                
                self.model_info = {
                    "model_type": type(self.model).__name__,
                    "features_count": getattr(self.model, 'n_features_in_', 8),
                    "classes": getattr(self.model, 'classes_', [0, 1]).tolist(),
                    "created_from": "existing_files"
                }
                
                logger.info(f"Successfully loaded {self.model_info['model_type']} model")
                self.is_loaded = True
                return True
            else:
                logger.warning("Model files not found. Creating sample model...")
                return self._create_sample_model()
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            logger.info("Creating fallback sample model...")
            return self._create_sample_model()
    
    def _create_sample_model(self) -> bool:
        """Create a sample fraud detection model"""
        try:
            logger.info("Creating sample fraud detection model...")
            
            # Generate synthetic training data
            np.random.seed(42)
            n_samples = 10000
            
            # Create realistic feature distributions
            data = {
                'amount': np.random.lognormal(3, 1.5, n_samples),
                'hour': np.random.randint(0, 24, n_samples),
                'day_of_week': np.random.randint(0, 7, n_samples),
                'is_weekend': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
                'customer_age': np.random.normal(40, 15, n_samples).clip(18, 80).astype(int),
                'account_balance': np.random.lognormal(8, 1, n_samples),
                'merchant_category': np.random.randint(0, 6, n_samples),
                'transaction_type': np.random.randint(0, 4, n_samples)
            }
            
            df = pd.DataFrame(data)
            
            # Create realistic fraud labels with business logic
            fraud_probability = (
                0.02 +  # Base fraud rate (2%)
                0.15 * (df['amount'] > df['amount'].quantile(0.95)) +
                0.08 * (df['hour'].isin([0, 1, 2, 3, 22, 23])) +
                0.05 * df['is_weekend'] +
                0.03 * (df['customer_age'] < 25) +
                0.04 * (df['merchant_category'] == 4) +
                0.06 * (df['amount'] > df['account_balance'] * 0.5)
            )
            
            fraud_probability = np.clip(fraud_probability, 0, 0.3)
            df['is_fraud'] = np.random.binomial(1, fraud_probability)
            
            # Prepare features and target
            X = df.drop('is_fraud', axis=1)
            y = df['is_fraud']
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Initialize and fit scaler
            self.scaler = MinMaxScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model = RandomForestClassifier(
                n_estimators=200,
                max_depth=15,
                min_samples_split=10,
                min_samples_leaf=5,
                random_state=42,
                class_weight='balanced',
                n_jobs=-1
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            train_score = self.model.score(X_train_scaled, y_train)
            test_score = self.model.score(X_test_scaled, y_test)
            
            # Save model and scaler
            joblib.dump(self.model, settings.MODEL_PATH)
            joblib.dump(self.scaler, settings.SCALER_PATH)
            
            # Store model information
            self.model_info = {
                "model_type": type(self.model).__name__,
                "features_count": self.model.n_features_in_,
                "classes": self.model.classes_.tolist(),
                "created_from": "sample_generation",
                "fraud_rate": f"{y.mean():.2%}",
                "samples_trained": len(X),
                "train_accuracy": f"{train_score:.3f}",
                "test_accuracy": f"{test_score:.3f}"
            }
            
            logger.info(f"Sample model created successfully:")
            logger.info(f"- Training accuracy: {train_score:.3f}")
            logger.info(f"- Test accuracy: {test_score:.3f}")
            logger.info(f"- Fraud rate: {y.mean():.2%}")
            
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to create sample model: {str(e)}")
            return False
    
    def preprocess_transaction(self, transaction: TransactionData) -> np.ndarray:
        """Preprocess transaction data for model prediction"""
        if not self.is_loaded or self.scaler is None:
            raise ValueError("Model not loaded")
        
        try:
            # Create feature vector matching training data format
            features = [
                float(transaction.amount),
                float(transaction.hour),
                float(transaction.day_of_week),
                float(1 if transaction.is_weekend else 0),
                float(transaction.customer_age),
                float(transaction.account_balance),
                float(self._encode_merchant_category(transaction.merchant_category)),
                float(self._encode_transaction_type(transaction.transaction_type))
            ]
            
            # Convert to numpy array and reshape
            feature_array = np.array(features).reshape(1, -1)
            
            # Validate feature array shape
            if feature_array.shape[1] != 8:
                raise ValueError(f"Expected 8 features, got {feature_array.shape[1]}")
            
            # Apply scaling
            scaled_features = self.scaler.transform(feature_array)
            
            return scaled_features
            
        except Exception as e:
            logger.error(f"Preprocessing error: {str(e)}")
            raise ValueError(f"Failed to preprocess transaction data: {str(e)}")
    
    def predict(self, transaction: TransactionData) -> Dict[str, Any]:
        """Make fraud prediction for a transaction"""
        if not self.is_loaded or self.model is None:
            raise ValueError("Model not loaded")
        
        try:
            # Preprocess the transaction
            processed_features = self.preprocess_transaction(transaction)
            
            # Make prediction
            prediction = self.model.predict(processed_features)[0]
            probabilities = self.model.predict_proba(processed_features)[0]
            fraud_probability = probabilities[1]  # Probability of fraud (class 1)
            
            # Calculate metrics
            is_fraud = bool(prediction)
            risk_level = self._get_risk_level(fraud_probability)
            confidence = self._get_confidence_score(fraud_probability)
            recommendations = self._get_recommendations(is_fraud, fraud_probability, risk_level)
            
            # Create message
            if is_fraud:
                message = "⚠️ FRAUD DETECTED - High risk transaction identified"
            else:
                message = "✅ LEGITIMATE - Transaction appears normal"
            
            return {
                "is_fraud": is_fraud,
                "fraud_probability": round(fraud_probability, 4),
                "risk_level": risk_level,
                "confidence": round(confidence, 4),
                "message": message,
                "recommendations": recommendations,
                "model_version": self.model_info.get("model_type", "Unknown")
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise ValueError(f"Prediction failed: {str(e)}")
    
    def _encode_merchant_category(self, category: str) -> int:
        """Encode merchant category to integer"""
        categories = ['grocery', 'gas', 'restaurant', 'retail', 'online', 'other']
        return categories.index(category.lower())
    
    def _encode_transaction_type(self, transaction_type: str) -> int:
        """Encode transaction type to integer"""
        types = ['debit', 'credit', 'transfer', 'withdrawal']
        return types.index(transaction_type.lower())
    
    def _get_risk_level(self, probability: float) -> str:
        """Determine risk level based on fraud probability"""
        if probability < settings.FRAUD_THRESHOLDS["low"]:
            return "Low"
        elif probability < settings.FRAUD_THRESHOLDS["medium"]:
            return "Medium"
        else:
            return "High"
    
    def _get_confidence_score(self, probability: float) -> float:
        """Calculate confidence score based on distance from 0.5"""
        return abs(probability - 0.5) * 2
    
    def _get_recommendations(self, is_fraud: bool, probability: float, risk_level: str) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if is_fraud:
            recommendations.extend([
                "🚫 Block transaction immediately",
                "📞 Contact customer for verification",
                "🔍 Review recent account activity",
                "⚠️ Flag account for monitoring"
            ])
            if probability > 0.8:
                recommendations.append("🔒 Consider temporary account freeze")
        else:
            recommendations.append("✅ Process transaction normally")
            if risk_level == "Medium":
                recommendations.extend([
                    "👀 Monitor for unusual patterns",
                    "📊 Log transaction for analysis"
                ])
            elif probability > 0.3:
                recommendations.append("⚡ Consider additional verification")
        
        return recommendations

# Global ML service instance
ml_service = MLService()