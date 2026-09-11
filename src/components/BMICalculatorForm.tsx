import { UnitSystem, Gender } from '../types';
import { 
  User, 
  Weight, 
  Ruler, 
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { kgToLbs, lbsToKg, cmToFeetInches, feetInchesToCm } from '../utils/bmi';

interface BMICalculatorFormProps {
  age: number;
  weightKg: number;
  heightCm: number;
  gender: Gender;
  unitSystem: UnitSystem;
  detectedHeightCm?: number | null;
  detectedHeightFeetInches?: string | null;
  onAgeChange: (age: number) => void;
  onWeightChange: (weightKg: number) => void;
  onHeightChange: (heightCm: number) => void;
  onGenderChange: (gender: Gender) => void;
  onUnitSystemChange: (unit: UnitSystem) => void;
  onCalculate: () => void;
}

export function BMICalculatorForm({
  age,
  weightKg,
  heightCm,
  gender,
  unitSystem,
  detectedHeightCm,
  detectedHeightFeetInches,
  onAgeChange,
  onWeightChange,
  onHeightChange,
  onGenderChange,
  onUnitSystemChange,
  onCalculate,
}: BMICalculatorFormProps) {
  // Display values depending on unitSystem
  const displayWeight = unitSystem === 'metric' ? weightKg : kgToLbs(weightKg);
  const { feet, inches } = cmToFeetInches(heightCm);

  const handleWeightInputChange = (val: number) => {
    if (isNaN(val) || val < 0) return;
    if (unitSystem === 'metric') {
      onWeightChange(val);
    } else {
      onWeightChange(lbsToKg(val));
    }
  };

  const handleHeightCmChange = (cm: number) => {
    if (isNaN(cm) || cm < 0) return;
    onHeightChange(cm);
  };

  const handleFeetChange = (newFeet: number) => {
    const cm = feetInchesToCm(newFeet, inches);
    onHeightChange(cm);
  };

  const handleInchesChange = (newInches: number) => {
    const cm = feetInchesToCm(feet, newInches);
    onHeightChange(cm);
  };

  const agePresets = [18, 25, 35, 45, 60];

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
      <div>
        {/* Form Title & Unit Toggle */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Body Metrics &amp; Parameters
              </h2>
              <p className="text-[11px] text-slate-400">
                Enter age, weight, and height for index calculation
              </p>
            </div>
          </div>

          {/* Unit System Switcher */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => onUnitSystemChange('metric')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                unitSystem === 'metric'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Metric (kg/cm)
            </button>
            <button
              onClick={() => onUnitSystemChange('imperial')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                unitSystem === 'imperial'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Imperial (lbs/ft)
            </button>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="space-y-4">
          {/* 1. AGE INPUT */}
          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="user-age-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Age (Years)
              </label>
              <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {age} yrs
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="user-age-input"
                type="number"
                min="5"
                max="120"
                value={age}
                onChange={(e) => onAgeChange(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-24 bg-slate-800 border border-slate-600 text-white font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="range"
                min="5"
                max="100"
                value={age}
                onChange={(e) => onAgeChange(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Quick Age Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400">Presets:</span>
              {agePresets.map((p) => (
                <button
                  key={p}
                  onClick={() => onAgeChange(p)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                    age === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {p}y
                </button>
              ))}
            </div>
          </div>

          {/* 2. WEIGHT INPUT */}
          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="user-weight-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-cyan-400" />
                Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
              </label>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {displayWeight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="user-weight-input"
                type="number"
                step="0.5"
                min="10"
                max={unitSystem === 'metric' ? 300 : 660}
                value={displayWeight}
                onChange={(e) => handleWeightInputChange(parseFloat(e.target.value) || 0)}
                className="w-24 bg-slate-800 border border-slate-600 text-white font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <input
                type="range"
                min={unitSystem === 'metric' ? 30 : 66}
                max={unitSystem === 'metric' ? 180 : 400}
                step={unitSystem === 'metric' ? 0.5 : 1}
                value={displayWeight}
                onChange={(e) => handleWeightInputChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* 3. HEIGHT INPUT */}
          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="user-height-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                Height ({unitSystem === 'metric' ? 'cm' : 'ft & in'})
              </label>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {unitSystem === 'metric' ? `${heightCm} cm` : `${feet}' ${inches}" (${heightCm} cm)`}
              </span>
            </div>

            {unitSystem === 'metric' ? (
              <div className="flex items-center gap-3">
                <input
                  id="user-height-input"
                  type="number"
                  min="80"
                  max="250"
                  value={heightCm}
                  onChange={(e) => handleHeightCmChange(parseInt(e.target.value) || 0)}
                  className="w-24 bg-slate-800 border border-slate-600 text-white font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={heightCm}
                  onChange={(e) => handleHeightCmChange(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={feet}
                      onChange={(e) => handleFeetChange(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-600 text-white font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400 font-bold">ft</span>
                  </div>
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={inches}
                      onChange={(e) => handleInchesChange(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-600 text-white font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400 font-bold">in</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={heightCm}
                  onChange={(e) => handleHeightCmChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}

            {/* Auto-detected height from image notice */}
            {detectedHeightCm && detectedHeightCm > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] text-slate-300">Auto-Detected Height:</span>
                  <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    {detectedHeightCm} cm {detectedHeightFeetInches ? `(${detectedHeightFeetInches})` : ''}
                  </span>
                </div>
                {heightCm !== detectedHeightCm ? (
                  <button
                    type="button"
                    onClick={() => onHeightChange(detectedHeightCm)}
                    className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold cursor-pointer active:scale-95 transition-all"
                  >
                    Sync to {detectedHeightCm} cm
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-medium">✓ In sync with photo</span>
                )}
              </div>
            )}
          </div>

          {/* 4. GENDER SELECTION */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] font-medium text-slate-400">Biological Context:</span>
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60">
              {(['male', 'female', 'unspecified'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => onGenderChange(g)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    gender === g
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g === 'unspecified' ? 'Neutral' : g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recalculate / Evaluate Trigger Button */}
      <div className="mt-4 pt-3 border-t border-slate-700/60">
        <button
          id="calculate-bmi-btn"
          onClick={onCalculate}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-98 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          Evaluate Body Mass Index
        </button>
      </div>
    </div>
  );
}
