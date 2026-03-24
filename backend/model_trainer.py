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
    
    # Simulate different types of transactions
    amounts = np.random.lognormal(5, 2, n_samples)
    types = np.random.choice(['TRANSFER', 'PAYMENT', 'CASH_OUT', 'CASH_IN', 'DEBIT'], n_samples)
    
    # Balance logic
    new_org = np.where(np.isin(types, ['TRANSFER', 'CASH_OUT', 'PAYMENT']), old_org - amounts, old_org + amounts)
    new_org = np.maximum(new_org, 0)
    
    old_dest = np.random.lognormal(8, 2, n_samples)
    new_dest = np.where(np.isin(types, ['TRANSFER', 'CASH_OUT']), old_dest + amounts, old_dest - amounts)
    new_dest = np.maximum(new_dest, 0)

    # Inject extreme anomalies (The "8-Trillion" and "Drained" cases)
    # Case 1: Account Draining (1% of transactions)
    drain_idx = np.random.choice(n_samples, int(n_samples * 0.01))
    new_org[drain_idx] = 0
    
    # Case 2: Astronomical Destination Jump (0.5% of transactions)
    jump_idx = np.random.choice(n_samples, int(n_samples * 0.005))
    new_dest[jump_idx] = 8000000000000.0

    # Engineered features
    diff_bal = new_org - old_org
    diff_dest = new_dest - old_dest
    is_transfer = (types == 'TRANSFER').astype(float)
    
    # Stronger label logic for training
    is_fraud = (
        ((types == 'TRANSFER') & (new_org == 0)) |
        (diff_dest > (amounts * 10)) |
        (amounts > 500000)
    )
    y = is_fraud.astype(int)

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