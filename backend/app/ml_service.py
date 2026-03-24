"""
Machine Learning service for fraud detection
"""
import logging
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from typing import Tuple, Dict, Any, Optional, List
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
                    "classes": list(getattr(self.model, 'classes_', [0, 1])),
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
            
            # Generate synthetic training data matching the expected 7 features
            np.random.seed(42)
            n_samples = 10000
            
            data = {
                'step': np.random.randint(1, 744, n_samples),
                'oldbalance_org': np.random.lognormal(8, 2, n_samples),
                'newbalance_orig': np.random.lognormal(8, 2, n_samples),
                'newbalance_dest': np.random.lognormal(8, 2, n_samples),
                'diff_new_old_balance': np.random.normal(0, 1000, n_samples),
                'diff_new_old_destiny': np.random.normal(0, 1000, n_samples),
                'type_TRANSFER': np.random.choice([0, 1], n_samples, p=[0.8, 0.2])
            }
            
            df = pd.DataFrame(data)
            
            # Basic dummy logic for generated data
            fraud_probability = (
                0.01 + 
                0.1 * df['type_TRANSFER'] + 
                0.05 * (df['diff_new_old_balance'] < -10000)
            )
            fraud_probability = np.clip(fraud_probability, 0, 0.3)
            df['is_fraud'] = np.random.binomial(1, fraud_probability)
            
            X = df.drop('is_fraud', axis=1)
            y = df['is_fraud']
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            self.scaler = MinMaxScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            self.model = RandomForestClassifier(
                n_estimators=50, max_depth=10, random_state=42, class_weight='balanced', n_jobs=-1
            )
            self.model.fit(X_train_scaled, y_train)
            
            train_score = self.model.score(X_train_scaled, y_train)
            test_score = self.model.score(X_test_scaled, y_test)
            
            joblib.dump(self.model, settings.MODEL_PATH)
            joblib.dump(self.scaler, settings.SCALER_PATH)
            
            self.model_info = {
                "model_type": type(self.model).__name__,
                "features_count": self.model.n_features_in_,
                "classes": self.model.classes_.tolist(),
                "created_from": "sample_generation"
            }
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
            # Engineered features
            diff_new_old_balance = transaction.newbalance_orig - transaction.oldbalance_org
            diff_new_old_destiny = transaction.newbalance_dest - transaction.oldbalance_dest
            type_transfer = 1.0 if transaction.type == 'TRANSFER' else 0.0

            # Create feature vector matching training data format
            # ['step', 'oldbalance_org', 'newbalance_orig', 'newbalance_dest', 'diff_new_old_balance', 'diff_new_old_destiny', 'type_TRANSFER']
            features = [
                float(transaction.step),
                float(transaction.oldbalance_org),
                float(transaction.newbalance_orig),
                float(transaction.newbalance_dest),
                float(diff_new_old_balance),
                float(diff_new_old_destiny),
                float(type_transfer)
            ]
            
            # Convert to numpy array and reshape
            feature_array = np.array(features).reshape(1, -1)
            
            # Validate feature array shape
            if feature_array.shape[1] != 7:
                raise ValueError(f"Expected 7 features, got {feature_array.shape[1]}")
            
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
            fraud_probability = float(probabilities[1])  # Probability of fraud (class 1)
            
            # --- HYBRID AI GUARDRAILS (Heuristic Overrides) ---
            message_override = None
            
            # 1. Account Draining Check (Origin)
            if transaction.type in ['TRANSFER', 'CASH_OUT'] and transaction.newbalance_orig == 0 and transaction.amount > 0:
                if abs(transaction.amount - transaction.oldbalance_org) < 0.1:
                    # If amount is small (<$100k) and math is correct, force as Safe
                    if transaction.amount < 100000:
                        fraud_probability = min(fraud_probability, 0.45) # Force "Medium/Low Risk"
                        prediction = 0 # FORCED SAFE
                    else:
                        fraud_probability = max(fraud_probability, 0.92)
                        prediction = 1
                        message_override = "🚨 HIGH RISK - Large account depletion detected"
            
            # 2. Extreme Destination Jump Check (The 8-Trillion Case)
            dest_delta = transaction.newbalance_dest - transaction.oldbalance_dest
            if transaction.type == 'TRANSFER' and dest_delta > (transaction.amount * 1.5) and dest_delta > 1000:
                # If destination grows way more than the amount transferred, it's anomalous
                fraud_probability = max(fraud_probability, 0.98)
                prediction = 1
                message_override = "🔴 CRITICAL ALERT - Astronomical balance anomaly detected"

            # 3. High Value Transaction Check
            if transaction.amount > 1000000: # Over $1M
                 fraud_probability = max(fraud_probability, 0.75)
                 if not message_override:
                     message_override = "⚠️ WARNING - High value transaction manual review"

            # Calculate metrics
            is_fraud = bool(prediction)
            risk_level = self._get_risk_level(fraud_probability)
            confidence = self._get_confidence_score(fraud_probability)
            recommendations = self._get_recommendations(is_fraud, fraud_probability, risk_level)
            
            # Create message
            if is_fraud:
                message = message_override if message_override else "⚠️ FRAUD DETECTED - High risk transaction identified"
            else:
                message = "✅ LEGITIMATE - Transaction appears normal"
                
            return {
                "is_fraud": is_fraud,
                "fraud_probability": round(float(fraud_probability), 4),
                "risk_level": risk_level,
                "confidence": round(float(confidence), 4),
                "message": message,
                "recommendations": recommendations,
                "model_version": self.model_info.get("model_type", "RandomForestClassifier")
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise ValueError(f"Prediction failed: {str(e)}")
    

    
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