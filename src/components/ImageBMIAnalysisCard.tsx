import { useState } from 'react';
import { 
  Scan, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  BellRing, 
  RotateCw, 
  RotateCcw,
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  Check, 
  Flame, 
  Eye, 
  Ruler, 
  Weight 
} from 'lucide-react';
import { ImageBMIAnalysis, UnitSystem } from '../types';
import { kgToLbs } from '../utils/bmi';
import { soundSynthesizer } from '../utils/audio';

interface ImageBMIAnalysisCardProps {
  analysis: ImageBMIAnalysis | null;
  isLoading: boolean;
  onReanalyze: () => void;
  onResetForNewScan?: () => void;
  onApplyEstimates: (heightCm: number, weightKg: number) => void;
  unitSystem: UnitSystem;
  volume: number;
}

export function ImageBMIAnalysisCard({
  analysis,
  isLoading,
  onReanalyze,
  onResetForNewScan,
  onApplyEstimates,
  unitSystem,
  volume,
}: ImageBMIAnalysisCardProps) {
  const [applied, setApplied] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-slate-800/90 border border-indigo-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md animate-pulse">
        {/* Scanning laser effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-cyan-500/15 to-transparent h-1/2 animate-bounce pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center animate-spin">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Analyzing Body from Captured Image
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold animate-pulse">
                AI Vision Scanning...
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Measuring body contours, posture proportions, and calculating accurate BMI...
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <div className="h-14 bg-slate-900/60 rounded-xl animate-pulse" />
          <div className="h-14 bg-slate-900/60 rounded-xl animate-pulse" />
          <div className="h-14 bg-slate-900/60 rounded-xl animate-pulse" />
          <div className="h-14 bg-slate-900/60 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const handleSoundWarning = () => {
    soundSynthesizer.playWarningBeep(analysis.bmi >= 35 ? 'critical' : 'high', volume);
  };

  const handleApply = () => {
    onApplyEstimates(analysis.estimatedHeightCm, analysis.estimatedWeightKg);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  const displayWeight = unitSystem === 'metric' 
    ? `${analysis.estimatedWeightKg} kg` 
    : `${kgToLbs(analysis.estimatedWeightKg)} lbs`;

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border shadow-2xl backdrop-blur-md transition-all ${
      analysis.isHigh
        ? 'bg-slate-900/95 border-amber-500/60 ring-2 ring-amber-500/20'
        : 'bg-slate-900/95 border-emerald-500/50 ring-1 ring-emerald-500/20'
    }`}>
      {/* Header with Title & Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            analysis.isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                Automatic Image BMI Analysis
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {analysis.source === 'gemini-vision' 
                    ? (analysis.modelUsed ? `Gemini Vision (${analysis.modelUsed.replace('gemini-', '')})` : 'Gemini Vision AI')
                    : 'Vision Anthropometry'}
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              {analysis.note || 'Biometric anthropometry calculated directly from the captured frame'}
            </p>
          </div>
        </div>

        {/* Confidence & Re-scan & New Scan Reset */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
            {analysis.confidenceScore}% Accurate
          </span>
          <button
            type="button"
            onClick={onReanalyze}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Re-analyze Captured Image"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          {onResetForNewScan && (
            <button
              id="analysis-card-reset-scan-btn"
              type="button"
              onClick={onResetForNewScan}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
              title="Reset image and start new scanning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Result & Warning Alert */}
      <div className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Big BMI Number */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Automatic Image BMI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl sm:text-5xl font-black tracking-tight font-mono ${
                analysis.isHigh ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {analysis.bmi.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400">kg/m²</span>
            </div>

            <div className={`mt-2 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              analysis.isHigh 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {analysis.isHigh ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {analysis.categoryLabel}
            </div>
          </div>

          {/* High Alert Action or Healthy Status */}
          <div className="md:col-span-7 flex flex-col gap-2.5">
            {analysis.isHigh ? (
              <div className="bg-amber-950/40 border border-amber-500/50 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    High BMI Warning Detected
                  </div>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Image assessment indicates body mass above normal thresholds (&ge; 25.0).
                  </p>
                </div>
                <button
                  onClick={handleSoundWarning}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/30 cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  <BellRing className="w-3.5 h-3.5 animate-bounce" />
                  Sound Alert Beep
                </button>
              </div>
            ) : (
              <div className="bg-emerald-950/30 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-200">
                  Healthy body proportions confirmed by AI vision scan. No elevated weight alarm required.
                </p>
              </div>
            )}

            {/* Estimated Metrics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Est. Weight</span>
                <strong className="text-cyan-300 font-mono">{displayWeight}</strong>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-cyan-500/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-bl-full" />
                <span className="text-[10px] text-cyan-400 font-bold block flex items-center gap-1">
                  <Ruler className="w-2.5 h-2.5" /> Auto Height
                </span>
                <strong className="text-white font-mono">
                  {analysis.heightEstimation?.estimatedHeightCm || analysis.estimatedHeightCm} cm
                  {analysis.heightEstimation?.heightFeetInches && (
                    <span className="text-cyan-300 font-normal text-[10px] ml-1">
                      ({analysis.heightEstimation.heightFeetInches})
                    </span>
                  )}
                </strong>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Body Fat Range</span>
                <strong className="text-amber-300">{analysis.bodyFatPercentageRange}</strong>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Physique</span>
                <strong className="text-white truncate block">{analysis.physiqueType}</strong>
              </div>
            </div>

            {/* Auto-Detected Height & Stature Analysis Banner */}
            <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-cyan-950/50 border border-cyan-500/40 rounded-xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      Auto-Detected Stature
                    </span>
                    <span className="text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 capitalize">
                      {analysis.heightEstimation?.framingType ? `${analysis.heightEstimation.framingType.replace('-', ' ')} stance` : 'Full-body Stance'}
                    </span>
                    {analysis.heightEstimation?.headRatio && (
                      <span className="text-[10px] text-indigo-300 font-mono">
                        {analysis.heightEstimation.headRatio}x head ratio
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-black text-white font-mono">
                      {analysis.heightEstimation?.estimatedHeightCm || analysis.estimatedHeightCm} cm
                    </span>
                    {analysis.heightEstimation?.heightFeetInches && (
                      <span className="text-xs font-bold text-cyan-300 font-mono">
                        ({analysis.heightEstimation.heightFeetInches})
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 truncate max-w-[280px]">
                      • {analysis.heightEstimation?.detectionMethod || 'Vertical stature & cranial proportion scanner'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="apply-detected-height-card-btn"
                type="button"
                onClick={() => {
                  onApplyEstimates(
                    analysis.heightEstimation?.estimatedHeightCm || analysis.estimatedHeightCm,
                    analysis.estimatedWeightKg
                  );
                  setApplied(true);
                  setTimeout(() => setApplied(false), 2500);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                  applied
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400/40 shadow-md shadow-cyan-600/20 active:scale-95'
                }`}
                title="Apply auto-detected height and mass to calculator"
              >
                {applied ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>{applied ? 'Height Applied' : 'Apply Detected Height'}</span>
              </button>
            </div>

            {/* Individual Body Shape Contour Assessment Bar */}
            {analysis.bodyShape && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-600/30 text-indigo-400">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
                      Body Shape Profile: {analysis.bodyShape.shapeLabel}
                    </span>
                    <p className="text-[11px] text-slate-300">
                      {analysis.bodyShape.shapeDescription}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                  <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                    WSR: <span className="text-cyan-400 font-bold">{analysis.bodyShape.waistToShoulderRatio}</span>
                  </span>
                  <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300 capitalize">
                    Contour: <span className="text-amber-300 font-bold">{analysis.bodyShape.torsoCurvature}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visual Landmarks & Observations */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Visual Observations List */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Visual Biometric Observations:
            </div>
            <ul className="space-y-1">
              {analysis.visualObservations.map((obs, idx) => (
                <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detected Landmarks & Pose Assessment */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Detected Posture &amp; Landmarks:
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  analysis.detectedLandmarks.headDetected ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Check className="w-3 h-3" /> Head
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  analysis.detectedLandmarks.shouldersDetected ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Check className="w-3 h-3" /> Shoulders
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  analysis.detectedLandmarks.torsoDetected ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Check className="w-3 h-3" /> Torso
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span className="text-slate-400">Framing stance:</span> {analysis.detectedLandmarks.postureAssessment}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleApply}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  applied
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border-slate-700'
                }`}
              >
                {applied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Values Synced to Inputs
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    Sync AI Estimates to Form
                  </>
                )}
              </button>

              {onResetForNewScan && (
                <button
                  type="button"
                  onClick={onResetForNewScan}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  New Scan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
