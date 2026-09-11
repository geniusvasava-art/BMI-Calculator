import { BMICategory, BMIResult } from '../types';

/**
 * Calculates BMI based on weight in kg and height in cm.
 * BMI = weight (kg) / (height (m))^2
 */
export function calculateBMI(weightKg: number, heightCm: number, age: number = 25): BMIResult {
  const heightMeters = heightCm / 100;
  if (heightMeters <= 0 || weightKg <= 0) {
    return {
      bmi: 0,
      category: 'normal',
      categoryLabel: 'Invalid Input',
      isHigh: false,
      severity: 'normal',
      color: '#10b981',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      idealWeightRange: { min: 0, max: 0 },
      weightDiffKg: 0,
      advice: ['Please enter valid weight and height measurements.'],
      riskFactors: [],
    };
  }

  const bmiRaw = weightKg / (heightMeters * heightMeters);
  const bmi = Math.round(bmiRaw * 10) / 10;

  // Ideal weight range for height based on WHO BMI 18.5 - 24.9
  const minIdealWeight = Math.round(18.5 * heightMeters * heightMeters * 10) / 10;
  const maxIdealWeight = Math.round(24.9 * heightMeters * heightMeters * 10) / 10;

  let category: BMICategory = 'normal';
  let categoryLabel = 'Normal Weight';
  let isHigh = false;
  let severity: 'low' | 'normal' | 'moderate' | 'high' | 'critical' = 'normal';
  let color = '#10b981'; // emerald
  let bgColor = 'bg-emerald-500/10 text-emerald-300';
  let borderColor = 'border-emerald-500/30';
  let weightDiffKg = 0;
  const advice: string[] = [];
  const riskFactors: string[] = [];

  if (bmi < 18.5) {
    category = 'underweight';
    categoryLabel = 'Underweight';
    isHigh = false;
    severity = 'low';
    color = '#38bdf8'; // sky
    bgColor = 'bg-sky-500/10 text-sky-300';
    borderColor = 'border-sky-500/30';
    weightDiffKg = Math.round((minIdealWeight - weightKg) * 10) / 10;
    advice.push('Increase nutrient-dense caloric intake with protein, healthy fats, and whole grains.');
    advice.push('Incorporate resistance and strength training to build healthy muscle mass.');
    riskFactors.push('Potential nutritional deficiency, reduced immunity, and bone density concerns.');
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'normal';
    categoryLabel = 'Healthy / Normal Weight';
    isHigh = false;
    severity = 'normal';
    color = '#10b981'; // emerald
    bgColor = 'bg-emerald-500/10 text-emerald-300';
    borderColor = 'border-emerald-500/30';
    weightDiffKg = 0;
    advice.push('Great job! Maintain your current balanced diet and regular physical activity.');
    advice.push('Aim for at least 150 minutes of moderate aerobic exercise each week.');
    riskFactors.push('Low cardiovascular and metabolic risk profile.');
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    category = 'overweight';
    categoryLabel = 'Overweight (Warning)';
    isHigh = true;
    severity = 'moderate';
    color = '#f59e0b'; // amber
    bgColor = 'bg-amber-500/15 text-amber-300';
    borderColor = 'border-amber-500/40';
    weightDiffKg = Math.round((weightKg - maxIdealWeight) * 10) / 10;
    advice.push('Focus on portion control and reduce refined sugars and ultra-processed foods.');
    advice.push('Engage in 30–45 minutes of daily brisk walking, swimming, or cycling.');
    advice.push('Monitor blood pressure and schedule routine annual checkups.');
    riskFactors.push('Elevated risk of pre-diabetes, hypertension, and mild joint stress.');
  } else if (bmi >= 30.0 && bmi <= 34.9) {
    category = 'obese1';
    categoryLabel = 'Obesity Class I (High Alert)';
    isHigh = true;
    severity = 'high';
    color = '#f97316'; // orange
    bgColor = 'bg-orange-500/15 text-orange-300';
    borderColor = 'border-orange-500/40';
    weightDiffKg = Math.round((weightKg - maxIdealWeight) * 10) / 10;
    advice.push('Consult a healthcare professional or registered dietitian for a personalized plan.');
    advice.push('Create a structured 500 kcal daily deficit with nutrient-dense meals.');
    advice.push('Incorporate low-impact exercises to protect knees and lumbar joints.');
    riskFactors.push('Increased risk of Type 2 diabetes, high cholesterol, and sleep apnea.');
  } else if (bmi >= 35.0 && bmi <= 39.9) {
    category = 'obese2';
    categoryLabel = 'Obesity Class II (High Alert)';
    isHigh = true;
    severity = 'high';
    color = '#ef4444'; // red
    bgColor = 'bg-rose-500/20 text-rose-300';
    borderColor = 'border-rose-500/50';
    weightDiffKg = Math.round((weightKg - maxIdealWeight) * 10) / 10;
    advice.push('Seek clinical guidance for medical weight management and metabolic monitoring.');
    advice.push('Undergo cardiac evaluation before starting vigorous workout routines.');
    advice.push('Focus on sustainable lifestyle modifications rather than crash diets.');
    riskFactors.push('Substantial risk of coronary heart disease, stroke, and chronic inflammation.');
  } else {
    category = 'obese3';
    categoryLabel = 'Obesity Class III / Severe (Critical)';
    isHigh = true;
    severity = 'critical';
    color = '#dc2626'; // dark red
    bgColor = 'bg-red-600/25 text-red-200';
    borderColor = 'border-red-500/60';
    weightDiffKg = Math.round((weightKg - maxIdealWeight) * 10) / 10;
    advice.push('Urgent: Schedule a comprehensive evaluation with a bariatric or metabolic specialist.');
    advice.push('Prioritize medically supervised nutrition and monitored rehabilitation activity.');
    advice.push('Track blood pressure, fasting glucose, and lipid panel regularly.');
    riskFactors.push('High risk of severe cardiovascular events, metabolic syndrome, and mobility limitations.');
  }

  // Age-specific context
  if (age < 18) {
    advice.push('Note: For children and teenagers under 18, BMI percentiles relative to age and gender are standard. Consult a pediatrician.');
  } else if (age >= 65 && bmi >= 25 && bmi <= 27) {
    advice.push('Note for seniors (65+): A slightly higher BMI (25-27) is often protective against bone fractures and frailty.');
  }

  return {
    bmi,
    category,
    categoryLabel,
    isHigh,
    severity,
    color,
    bgColor,
    borderColor,
    idealWeightRange: {
      min: minIdealWeight,
      max: maxIdealWeight,
    },
    weightDiffKg,
    advice,
    riskFactors,
  };
}

/** Unit conversion helpers */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}
