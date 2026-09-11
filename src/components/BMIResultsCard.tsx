import { BMIResult, UnitSystem } from '../types';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  BookmarkCheck,
  Target,
  Sparkles
} from 'lucide-react';
import { kgToLbs } from '../utils/bmi';

interface BMIResultsCardProps {
  result: BMIResult;
  unitSystem: UnitSystem;
  onSaveRecord: () => void;
  hasCapturedImage: boolean;
  isSaved: boolean;
}

export function BMIResultsCard({
  result,
  unitSystem,
  onSaveRecord,
  hasCapturedImage,
  isSaved,
}: BMIResultsCardProps) {
  // Determine percentage along gauge spectrum (from BMI 15 to 45)
  const minScale = 15;
  const maxScale = 45;
  const clampedBMI = Math.min(Math.max(result.bmi, minScale), maxScale);
  const gaugePercent = ((clampedBMI - minScale) / (maxScale - minScale)) * 100;

  const displayIdealMin = unitSystem === 'metric' ? result.idealWeightRange.min : kgToLbs(result.idealWeightRange.min);
  const displayIdealMax = unitSystem === 'metric' ? result.idealWeightRange.max : kgToLbs(result.idealWeightRange.max);
  const displayDiff = unitSystem === 'metric' ? Math.abs(result.weightDiffKg) : kgToLbs(Math.abs(result.weightDiffKg));
  const unitLabel = unitSystem === 'metric' ? 'kg' : 'lbs';

  return (
    <div className={`bg-slate-800/80 border rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm transition-all ${
      result.isHigh 
        ? 'border-amber-500/50 ring-1 ring-amber-500/20' 
        : 'border-slate-700/80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            result.isHigh 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              BMI Assessment Result
            </h2>
            <p className="text-[11px] text-slate-400">
              WHO standard biometric evaluation
            </p>
          </div>
        </div>

        {/* Category Pill */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${result.bgColor} ${result.borderColor}`}>
          {result.isHigh ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          {result.categoryLabel}
        </div>
      </div>

      {/* Main Metric Spotlight */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 mb-4">
        {/* BMI Numeric Value */}
        <div className="sm:col-span-5 flex flex-col items-center sm:items-start border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0 sm:pr-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Calculated Index
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span 
              className="text-4xl sm:text-5xl font-black tracking-tight font-mono"
              style={{ color: result.color }}
            >
              {result.bmi.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">kg/m²</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            Severity: <strong className="capitalize text-slate-200">{result.severity}</strong>
          </span>
        </div>

        {/* Target Weight & Difference */}
        <div className="sm:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              Healthy Weight Goal:
            </span>
            <span className="font-bold text-emerald-400">
              {displayIdealMin} – {displayIdealMax} {unitLabel}
            </span>
          </div>

          {result.weightDiffKg !== 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                {result.weightDiffKg > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
                )}
                {result.weightDiffKg > 0 ? 'Weight above normal:' : 'Weight below normal:'}
              </span>
              <span className={`font-bold ${result.weightDiffKg > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                {result.weightDiffKg > 0 ? `+${displayDiff}` : `-${displayDiff}`} {unitLabel}
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            {result.category === 'normal'
              ? '✨ Your weight is well-aligned with your height.'
              : result.isHigh
              ? `⚠️ A weight reduction of approx. ${displayDiff} ${unitLabel} would place you in the healthy range.`
              : `ℹ️ A weight gain of approx. ${displayDiff} ${unitLabel} would place you in the healthy range.`}
          </div>
        </div>
      </div>

      {/* Visual Color-Coded BMI Spectrum Gauge Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-0.5">
          <span>15.0</span>
          <span>18.5</span>
          <span>25.0</span>
          <span>30.0</span>
          <span>35.0</span>
          <span>45.0+</span>
        </div>

        {/* Multi-segment bar */}
        <div className="relative w-full h-3.5 rounded-full overflow-hidden flex bg-slate-900 border border-slate-700">
          <div className="w-[11.6%] bg-sky-500" title="Underweight (<18.5)" />
          <div className="w-[21.3%] bg-emerald-500" title="Normal (18.5 - 24.9)" />
          <div className="w-[16.7%] bg-amber-500" title="Overweight (25.0 - 29.9)" />
          <div className="w-[16.7%] bg-orange-500" title="Obese I (30.0 - 34.9)" />
          <div className="w-[16.7%] bg-rose-500" title="Obese II (35.0 - 39.9)" />
          <div className="w-[17.0%] bg-red-700" title="Obese III / Severe (40.0+)" />
        </div>

        {/* Pointer Pin indicator */}
        <div className="relative w-full h-4">
          <div 
            className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
            style={{ left: `${gaugePercent}%` }}
          >
            <div 
              className="w-3 h-3 rotate-45 border-2 border-white shadow-md rounded-xs"
              style={{ backgroundColor: result.color }}
            />
          </div>
        </div>
      </div>

      {/* Advice & Risk Checklist */}
      <div className="space-y-2 mb-4">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Health Guidance &amp; Insights:
        </span>
        <ul className="space-y-1.5">
          {result.advice.map((item, idx) => (
            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Save to Log Button */}
      <button
        id="save-bmi-record-btn"
        onClick={onSaveRecord}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
          isSaved
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600 shadow-md'
        }`}
      >
        {isSaved ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Saved to Body Scan History
          </>
        ) : (
          <>
            <BookmarkCheck className="w-4 h-4" />
            {hasCapturedImage ? 'Save Photo & BMI Assessment' : 'Save BMI Assessment Record'}
          </>
        )}
      </button>
    </div>
  );
}
