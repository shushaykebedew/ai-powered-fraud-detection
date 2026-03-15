"""
Script to extract and save the trained model from the Jupyter notebook
This script should be run after training the model in the notebook
"""
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_sample_model():
    """
    Create a sample fraud detection model for demonstration
    In production, this would load data from your actual dataset
    """
    logger.info("Creating sample fraud detection model...")
    
    # Generate synthetic fraud detection data
    np.random.seed(42)
    n_samples = 10000
    
    # Features: amount, hour, day_of_week, is_weekend, customer_age, account_balance, merchant_category, transaction_type
    data = {
        'amount': np.random.lognormal(3, 1.5, n_samples),  # Transaction amounts
        'hour': np.random.randint(0, 24, n_samples),
        'day_of_week': np.random.randint(0, 7, n_samples),
        'is_weekend': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        'customer_age': np.random.randint(18, 80, n_samples),
        'account_balance': np.random.lognormal(8, 1, n_samples),
        'merchant_category': np.random.randint(0, 6, n_samples),  # 6 categories
        'transaction_type': np.random.randint(0, 4, n_samples)    # 4 types
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Create fraud labels (10% fraud rate)
    # Higher probability of fraud for:
    # - Large amounts
    # - Late night transactions
    # - Weekend transactions
    fraud_probability = (
        0.05 +  # Base rate
        0.1 * (df['amount'] > df['amount'].quantile(0.9)) +  # Large amounts
        0.05 * (df['hour'].isin([22, 23, 0, 1, 2, 3])) +    # Late night
        0.03 * df['is_weekend'] +                            # Weekend
        0.02 * (df['customer_age'] < 25)                     # Young customers
    )
    
    df['is_fraud'] = np.random.binomial(1, fraud_probability)
    
    logger.info(f"Generated {n_samples} samples with {df['is_fraud'].sum()} fraud cases ({df['is_fraud'].mean():.2%} fraud rate)")
    
    # Prepare features and target
    X = df.drop('is_fraud', axis=1)
    y = df['is_fraud']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'  # Handle class imbalance
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    logger.info(f"Model training completed:")
    logger.info(f"Training accuracy: {train_score:.3f}")
    logger.info(f"Test accuracy: {test_score:.3f}")
    
    # Save model and scaler
    joblib.dump(model, 'fraud_model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    
    logger.info("Model and scaler saved successfully!")
    
    return model, scaler

if __name__ == "__main__":
    create_sample_model()