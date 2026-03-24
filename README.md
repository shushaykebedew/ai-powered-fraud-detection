# SafeguardAI - AI-Powered Fraud Detection

A production-ready Enterprise SaaS dashboard for real-time financial fraud detection using machine learning.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Python 3.9+
- Brave Browser (Recommended)

### 2. Backend Setup
```bash
cd backend
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server (Development mode auto-generates a sample model)
python run.py
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Dashboard will be available at `http://localhost:3000`.

## 🛠 Features
- **Real-time AI Analyzer**: Instantly score transactions against the PaySim model.
- **Interactive Dashboard**: Modern SaaS interface with time-range filtering.
- **Transaction History**: Full audit log with CSV export and risk filtering.
- **Secure Settings**: Manage API keys and model risk thresholds.

## 🧠 Machine Learning Model
The system uses a **Random Forest Classifier** trained on a 7-feature transactional schema:
1. `step` (Time)
2. `oldbalance_org` (Origin Initial Balance)
3. `newbalance_orig` (Origin Final Balance)
4. `newbalance_dest` (Destination Initial Balance)
5. `diff_new_old_balance` (Origin Delta)
6. `diff_new_old_destiny` (Destination Delta)
7. `type_TRANSFER` (Binary Flag)

---
© 2026 SafeguardAI Systems