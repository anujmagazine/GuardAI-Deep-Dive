
export enum LicenseTier {
  FREE = 'Free',
  PRO = 'Pro/Paid',
  ENTERPRISE = 'Enterprise'
}

export interface DataFlowStep {
  step: string;
  description: string;
  dataTypes: string[];
}

export interface SpecificRisk {
  category: string;
  risk: string;
  mitigation: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface SafetySetting {
  title: string;
  steps: string[];
}

export interface DeepDiveResult {
  toolName: string;
  licenseTier: LicenseTier;
  scenario: string;
  scenarioSummary: string; // Brief executive summary of the analyzed scenario
  dataFlowAnalysis: DataFlowStep[];
  specificRisks: SpecificRisk[];
  safetySettings: {
    available: boolean;
    configurations: SafetySetting[];
  };
  verdict: {
    summary: string;
    securityScore: number; // 0 to 100
    recommendation: string;
  };
  truthBomb: string;
  sources: { title: string; uri: string }[];
}

export interface AnalysisInput {
  toolName: string;
  website: string;
  licenseTier: LicenseTier;
  scenario: string;
}
