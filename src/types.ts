export type UnitSystem = 'metric' | 'imperial';
export type Gender = 'male' | 'female' | 'unspecified';

export type BMICategory = 
  | 'underweight' 
  | 'normal' 
  | 'overweight' 
  | 'obese1' 
  | 'obese2' 
  | 'obese3';

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  categoryLabel: string;
  isHigh: boolean;
  severity: 'low' | 'normal' | 'moderate' | 'high' | 'critical';
  color: string;
  bgColor: string;
  borderColor: string;
  idealWeightRange: {
    min: number; // in kg
    max: number; // in kg
  };
  weightDiffKg: number; // difference from upper/lower healthy limit
  advice: string[];
  riskFactors: string[];
}

export interface DetectedLandmarks {
  headDetected: boolean;
  shouldersDetected: boolean;
  torsoDetected: boolean;
  fullBodyVisible: boolean;
  postureAssessment: string;
}

export interface HeightEstimation {
  estimatedHeightCm: number;
  heightFeetInches: string; // e.g. "5' 9\""
  confidenceScore: number;
  framingType: 'full-body' | 'three-quarters' | 'upper-body';
  detectionMethod: string;
  headRatio?: number;
  verticalLandmarks?: {
    crownYPercent: number; // 0 to 100
    shoulderYPercent: number;
    waistYPercent: number;
    baseYPercent: number;
  };
}

export interface ImageBMIAnalysis {
  bmi: number;
  category: BMICategory;
  categoryLabel: string;
  isHigh: boolean;
  confidenceScore: number;
  estimatedHeightCm: number;
  estimatedWeightKg: number;
  bodyFatPercentageRange: string;
  physiqueType: string;
  heightEstimation?: HeightEstimation;
  bodyShape?: {
    shapeType: 'slim' | 'athletic' | 'average' | 'overweight' | 'obese';
    shapeLabel: string;
    shapeDescription: string;
    waistToShoulderRatio: number;
    torsoCurvature: string;
    silhouetteDensity: number;
  };
  visualObservations: string[];
  healthInsights: string[];
  detectedLandmarks: DetectedLandmarks;
  source: 'gemini-vision' | 'algorithmic-biometric';
  note?: string;
  modelUsed?: string;
}

export interface BodyScanRecord {
  id: string;
  timestamp: number;
  imageDataUrl: string | null;
  age: number;
  weightKg: number;
  heightCm: number;
  unitSystem: UnitSystem;
  bmi: number;
  category: BMICategory;
  categoryLabel: string;
  isHigh: boolean;
  imageAnalysis?: ImageBMIAnalysis;
  notes?: string;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number; // 0 to 1
  autoPlayOnHigh: boolean;
  beepTone: 'standard' | 'high-pitch' | 'siren';
}
