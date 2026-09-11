import { useState } from 'react';
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  BellRing, 
  ShieldAlert, 
  HeartHandshake, 
  Sparkles,
  X,
  Stethoscope
} from 'lucide-react';
import { BMIResult, AudioSettings } from '../types';
import { soundSynthesizer } from '../utils/audio';

interface HighBMIWarningAlertProps {
  result: BMIResult;
  audioSettings: AudioSettings;
  onUpdateAudio: (settings: AudioSettings) => void;
}

export function HighBMIWarningAlert({
  result,
  audioSettings,
  onUpdateAudio,
}: HighBMIWarningAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!result.isHigh || isDismissed) {
    return null;
  }

  const handleManualBeep = () => {
    soundSynthesizer.playWarningBeep(result.severity === 'critical' ? 'critical' : 'high', audioSettings.volume);
  };

  const getAlertColorClasses = () => {
    switch (result.severity) {
      case 'critical':
        return {
          cardBg: 'bg-red-950/70 border-red-500/80 ring-2 ring-red-500/30',
          badgeBg: 'bg-red-500 text-slate-950',
          title: 'CRITICAL HIGH BMI WARNING',
          buttonBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40',
        };
      case 'high':
        return {
          cardBg: 'bg-orange-950/70 border-orange-500/70 ring-1 ring-orange-500/30',
          badgeBg: 'bg-orange-500 text-slate-950',
          title: 'HIGH BODY MASS INDEX ALERT',
          buttonBg: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/40',
        };
      default:
        return {
          cardBg: 'bg-amber-950/60 border-amber-500/60 ring-1 ring-amber-500/20',
          badgeBg: 'bg-amber-500 text-slate-950',
          title: 'ELEVATED BMI WARNING',
          buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/40',
        };
    }
  };

  const config = getAlertColorClasses();

  return (
    <div 
      className={`rounded-2xl p-4 sm:p-5 border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-top duration-300 ${config.cardBg}`}
    >
      {/* Alert Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${config.badgeBg}`}>
                {config.title}
              </span>
              <span className="text-xs font-mono font-bold text-amber-200">
                BMI: {result.bmi.toFixed(1)} kg/m² ({result.categoryLabel})
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Body Mass Index exceeds the standard healthy threshold (&ge; 25.0). Health risks may be elevated.
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
          title="Dismiss Alert Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Warning Content & Sound Trigger Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Risk factors list */}
        <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
          <span className="font-semibold text-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Identified Factors:
          </span>
          {result.riskFactors.map((factor, i) => (
            <span key={i} className="bg-black/30 px-2 py-0.5 rounded text-[11px] border border-white/5">
              {factor}
            </span>
          ))}
        </div>

        {/* Audio Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Re-trigger Warning Beep button */}
          <button
            id="play-warning-beep-alert-btn"
            onClick={handleManualBeep}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${config.buttonBg}`}
            title="Sound the audible warning beep alarm"
          >
            <BellRing className="w-4 h-4 animate-bounce" />
            Sound Warning Beep
          </button>

          {/* Mute/Unmute quick toggle */}
          <button
            onClick={() => onUpdateAudio({ ...audioSettings, enabled: !audioSettings.enabled })}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
              audioSettings.enabled
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-rose-900/60 text-rose-200 border-rose-700'
            }`}
            title={audioSettings.enabled ? 'Mute Alarm' : 'Unmute Alarm'}
          >
            {audioSettings.enabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
        </div>
      </div>
    </div>
  );
}
