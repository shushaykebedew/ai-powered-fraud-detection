export type TransactionType =
  | "CASH_IN"
  | "CASH_OUT"
  | "DEBIT"
  | "PAYMENT"
  | "TRANSFER";

export interface TransactionInput {
  step: number;
  type: TransactionType;
  amount: number;
  name_orig: string;
  oldbalance_org: number;
  newbalance_orig: number;
  name_dest: string;
  oldbalance_dest: number;
  newbalance_dest: number;
}

export interface RiskFactor {
  feature: string;
  contribution: number;
  direction: "increases_risk" | "decreases_risk";
}

export type RiskLevel = "low" | "medium" | "high";

export interface PredictionResult {
  id: string;
  risk_score: number;
  is_fraud_predicted: boolean;
  risk_level: RiskLevel;
  model_version: string;
  top_factors: RiskFactor[];
  created_at: string;
}

export interface PredictionHistoryItem {
  id: string;
  risk_score: number;
  is_fraud_predicted: boolean;
  model_version: string;
  created_at: string;
  transaction_input: TransactionInput;
}

export interface PredictionHistoryPage {
  items: PredictionHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserOut {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserOut;
}

export interface ModelPerformance {
  model_version: string;
  model_type: string;
  decision_threshold: number;
  test_metrics: {
    roc_auc: number;
    pr_auc: number;
    f1_at_threshold: number;
    f1_at_default: number;
  };
  training_rows: number;
  fraud_rate_train: number;
}

export interface PredictionSummary {
  period_days: number;
  total_predictions: number;
  fraud_flagged: number;
  fraud_rate: number;
  average_risk_score: number;
  daily_breakdown: { date: string; total: number; fraud: number }[];
}

export interface BatchRowResult {
  row: number;
  status: "scored" | "error";
  error?: string | null;
  risk_score?: number | null;
  is_fraud_predicted?: boolean | null;
  risk_level?: RiskLevel | null;
  prediction_id?: string | null;
}

export interface BatchPredictionResponse {
  total_rows: number;
  scored: number;
  failed: number;
  fraud_flagged: number;
  results: BatchRowResult[];
}

export type AdminUser = UserOut;

export interface PlatformStats {
  total_users: number;
  active_users: number;
  total_predictions: number;
  total_fraud_flagged: number;
}
