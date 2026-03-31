export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";

export type TransactionStatus =
  | "PENDING"
  | "FLAGGED"
  | "CLEARED"
  | "REVIEWING"
  | "BLOCKED";

export type TransactionCategory =
  | "ONLINE_PURCHASE"
  | "ATM_WITHDRAWAL"
  | "WIRE_TRANSFER"
  | "POINT_OF_SALE"
  | "CRYPTO_EXCHANGE"
  | "INTERNATIONAL"
  | "BILL_PAYMENT"
  | "PEER_TO_PEER";

export interface Transaction {
  id: string;
  timestamp: Date;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategory: TransactionCategory;
  merchantCountry: string;
  merchantCity: string;
  cardLast4: string;
  userId: string;
  userName: string;
  userEmail: string;
  userLocation: string;
  ipAddress: string;
  deviceFingerprint: string;
  isNewDevice: boolean;
  isVPN: boolean;
  velocityCount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  flagReasons: string[];
  aiExplanation: string;
  isAnalyzed: boolean;
  lat: number;
  lng: number;
  aiConfidence?: number;
  detectedPatterns?: string[];
  recommendation?: "BLOCK" | "FLAG" | "REVIEW" | "CLEAR";
  analysisQueuePosition?: number;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  transaction: Transaction;
  alertType:
    | "VELOCITY"
    | "GEO_ANOMALY"
    | "AMOUNT_SPIKE"
    | "NEW_DEVICE"
    | "VPN_DETECTED"
    | "PATTERN_MATCH";
  severity: RiskLevel;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  flagReasons: string[];
  explanation: string;
  recommendation: "BLOCK" | "FLAG" | "REVIEW" | "CLEAR";
  confidence: number;
  detectedPatterns: string[];
}

export interface DashboardStats {
  totalTransactions: number;
  flaggedCount: number;
  blockedCount: number;
  clearedCount: number;
  totalAmountProtected: number;
  fraudRate: number;
  avgRiskScore: number;
  alertsActive: number;
}

export interface SimulatorSettings {
  velocityThreshold: number;
  highAmountThreshold: number;
  geoAnomalyKm: number;
  autoBlockCritical: boolean;
  patternVelocity: boolean;
  patternGeo: boolean;
  patternAmount: boolean;
  patternVpn: boolean;
  patternNewDevice: boolean;
  patternCardTesting: boolean;
  amountMin: number;
  amountMax: number;
  animationSpeed: "normal" | "reduced" | "none";
  soundEnabled: boolean;
}
