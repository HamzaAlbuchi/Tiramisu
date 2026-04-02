export interface DebateRequestBody {
  topic: string;
  rounds: number;
  style: string;
  temperatureMode?: "BALANCED" | "CUSTOM" | "RANDOM";
  proTemperature?: number;
  againstTemperature?: number;
  /** OpenAI-compatible chat-completions URL (backend appends /v1/chat/completions when needed). */
  customEndpointUrl?: string;
  customApiKey?: string;
  customModelId?: string;
  customModelLabel?: string;
}

export interface MetricPair {
  pro: number;
  against: number;
}

export interface DebateMetrics {
  logicalConsistency: MetricPair;
  argumentStrength: MetricPair;
  rebuttalQuality: MetricPair;
  biasNeutrality: MetricPair;
  clarity: MetricPair;
}

export interface DebateAnalysis {
  summary: string;
  hallucinationBias: string;
  accuracyAssessment: string;
  finalReasoning: string;
  strengthsPro: string[];
  strengthsAgainst: string[];
  weaknessesPro: string[];
  weaknessesAgainst: string[];
}

export interface DebateEvaluation {
  winner: string;
  winnerLabel: string;
  confidence: number;
  verdictType: string;
  hallucinationRiskScore: number;
  accuracySignalScore: number;
  metrics: DebateMetrics;
  analysis: DebateAnalysis;
  turnAnalysis?: Array<{
    round: number;
    role: string;
    biasFlags: string[];
    fallacies: string[];
    claimStrength: number;
  }>;
  biasSummary?: {
    framing: string;
    omission: string;
    authority: string;
    recency: string;
  };
}

export interface DebateModels {
  pro: string;
  against: string;
  /** When true, UI shows CUSTOM styling for transcript model names. */
  custom?: boolean;
}

export interface DebateTurn {
  index: number;
  side: string;
  modelName: string;
  role: string;
  text: string;
  temperature: number;
}

export interface DebateResponse {
  topic: string;
  style: string;
  rounds: number;
  exchangeCount: number;
  proTemperatureUsed: number;
  againstTemperatureUsed: number;
  models: DebateModels;
  turns: DebateTurn[];
  evaluation: DebateEvaluation;
}
