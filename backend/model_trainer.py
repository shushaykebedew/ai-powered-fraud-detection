"""
Script to create the sample fraud detection model using the 7-feature schema
Matches the preprocessing logic in ml_service.py
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
    Create a sample fraud detection model for the 7-feature schema:
    [step, oldbalance_org, newbalance_orig, newbalance_dest, diff_orig, diff_dest, type_TRANSFER]
    """
    logger.info("Creating sample fraud detection model (7-feature schema)...")
    
    np.random.seed(42)
    n_samples = 10000
    
    # Generate synthetic data matching TransactionData model
    steps = np.random.randint(1, 744, n_samples)
    old_org = np.random.lognormal(8, 2, n_samples)
    new_org = np.random.lognormal(8, 2, n_samples)
    new_dest = np.random.lognormal(8, 2, n_samples)
    diff_bal = np.random.normal(0, 1000, n_samples)
    diff_dest = np.random.normal(0, 1000, n_samples)
    is_transfer = np.random.choice([0, 1], n_samples, p=[0.8, 0.2])
    
    # Basic dummy logic for generated data (matches ml_service.py Step 587)
    fraud_probability = (
        0.01 + 
        0.1 * is_transfer + 
        0.05 * (diff_bal < -10000)
    )
    fraud_probability = np.clip(fraud_probability, 0, 0.3)
    y = np.random.binomial(1, fraud_probability)

    data = {
        'step': steps,
        'oldbalance_org': old_org,
        'newbalance_orig': new_org,
        'newbalance_dest': new_dest,
        'diff_new_old_balance': diff_bal,
        'diff_new_old_destiny': diff_dest,
        'type_TRANSFER': is_transfer,
        'is_fraud': y
    }
    
    df = pd.DataFrame(data)
    
    logger.info(f"Generated {n_samples} samples with {df['is_fraud'].sum()} fraud cases")
    
    X = df.drop('is_fraud', axis=1)
    y = df['is_fraud']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestClassifier(
        n_estimators=50,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    
    model.fit(X_train_scaled, y_train)
    
    joblib.dump(model, 'fraud_model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    
    logger.info("Model and scaler saved successfully!")
    
    return model, scaler

if __name__ == "__main__":
    create_sample_model()