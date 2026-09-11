import { 
  HelpCircle, 
  X, 
  Camera, 
  BellRing, 
  Activity, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpGuideModal({ isOpen, onClose }: HelpGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                How It Works &amp; Guide
              </h2>
              <p className="text-xs text-slate-400">
                Webcam capture, BMI thresholds, and audio warning alarms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Step 1: Camera Framing */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Camera className="w-4 h-4 text-indigo-400" />
              1. Webcam Human Body Capture
            </div>
            <p>
              Grant camera permissions to activate the live feed. Step back approx. 1.5–2 meters and match your posture with the dotted body silhouette overlay. You can use the 3s or 5s delay timer to step back into pose, or click "Capture Body Image" anytime.
            </p>
          </div>

          {/* Step 2: Weight & Age Input */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Activity className="w-4 h-4 text-cyan-400" />
              2. Enter Age, Weight &amp; Height
            </div>
            <p>
              Input your age, body weight (in kg or lbs), and height (in cm or ft/in). The application calculates Body Mass Index using the standard formula: <code className="text-cyan-300 font-mono">BMI = weight (kg) / [height (m)]²</code>.
            </p>
          </div>

          {/* Step 3: High BMI Audio Beep Warning */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <BellRing className="w-4 h-4 text-amber-400" />
              3. Automatic High-BMI Audio Warning Beep &amp; Alert
            </div>
            <p>
              If the calculated Body Mass Index is <strong>25.0 or higher</strong> (classified as Overweight or Obese by WHO), the application immediately plays a synthesised warning beep alarm through your PC speakers and shows an active alert banner with risk factors and healthy weight targets.
            </p>
          </div>

          {/* WHO Table */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <div className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              WHO BMI Classification Chart
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20 text-sky-200">
                <strong>&lt; 18.5:</strong> Underweight
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                <strong>18.5 – 24.9:</strong> Normal (Healthy)
              </div>
              <div className="p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-200 font-semibold">
                <strong>25.0 – 29.9:</strong> Overweight ⚠️ (Beep)
              </div>
              <div className="p-2 rounded bg-orange-500/15 border border-orange-500/30 text-orange-200 font-semibold">
                <strong>30.0 – 34.9:</strong> Obese Class I ⚠️ (Beep)
              </div>
              <div className="p-2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-200 font-semibold">
                <strong>35.0 – 39.9:</strong> Obese Class II 🚨 (High Beep)
              </div>
              <div className="p-2 rounded bg-red-600/25 border border-red-500/50 text-red-200 font-bold">
                <strong>&ge; 40.0:</strong> Severe Obese 🚨 (Critical Alarm)
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
