import { useState } from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  BellRing, 
  Camera, 
  History, 
  HelpCircle,
  Sliders
} from 'lucide-react';
import { AudioSettings } from '../types';
import { soundSynthesizer } from '../utils/audio';

interface HeaderProps {
  audioSettings: AudioSettings;
  onUpdateAudio: (settings: AudioSettings) => void;
  isHighBMI: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  cameraActive: boolean;
}

export function Header({
  audioSettings,
  onUpdateAudio,
  isHighBMI,
  historyCount,
  onOpenHistory,
  onOpenHelp,
  cameraActive,
}: HeaderProps) {
  const [showAudioMenu, setShowAudioMenu] = useState(false);

  const handleTestBeep = () => {
    soundSynthesizer.playWarningBeep('high', audioSettings.volume);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                BodyCam BMI
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PC Workstation
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Webcam Body Capture &amp; Real-time Mass Index Assessment
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Camera Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
            cameraActive 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{cameraActive ? 'Webcam Live' : 'Camera Standby'}</span>
            <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          </div>

          {/* High BMI Warning Indicator in Header if active */}
          {isHighBMI && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">HIGH BMI ALERT</span>
            </div>
          )}

          {/* Audio Alarm Setting Dropdown */}
          <div className="relative">
            <button
              id="audio-controls-toggle-btn"
              onClick={() => setShowAudioMenu(!showAudioMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                audioSettings.enabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40'
              }`}
              title="Audio Warning Beep Settings"
            >
              {audioSettings.enabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-400" />
              )}
              <span className="hidden sm:inline">
                {audioSettings.enabled ? 'Beep ON' : 'Muted'}
              </span>
              <Sliders className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Audio Dropdown Popover */}
            {showAudioMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 p-4 rounded-xl bg-slate-800/95 border border-slate-700 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Alarm Sound Synthesizer
                  </span>
                  <button
                    onClick={() => setShowAudioMenu(false)}
                    className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 pt-3 text-xs">
                  {/* Master Toggle */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 font-medium">Enable Warning Beep</span>
                    <input
                      type="checkbox"
                      checked={audioSettings.enabled}
                      onChange={(e) =>
                        onUpdateAudio({ ...audioSettings, enabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-indigo-500 bg-slate-700 border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-800"
                    />
                  </label>

                  {/* Auto Play on High BMI */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-300 font-medium block">Auto-Alert on High BMI</span>
                      <span className="text-[10px] text-slate-400">Beep immediately when BMI &ge; 25.0</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={audioSettings.autoPlayOnHigh}
                      onChange={(e) =>
                        onUpdateAudio({ ...audioSettings, autoPlayOnHigh: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-indigo-500 bg-slate-700 border-slate-600 focus:ring-indigo-500"
                    />
                  </label>

                  {/* Volume Slider */}
                  <div>
                    <div className="flex justify-between text-slate-300 font-medium mb-1">
                      <span>Alarm Volume</span>
                      <span className="text-cyan-400 font-bold">{Math.round(audioSettings.volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={audioSettings.volume}
                      onChange={(e) =>
                        onUpdateAudio({ ...audioSettings, volume: parseFloat(e.target.value) })
                      }
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Test Beep Button */}
                  <button
                    id="test-warning-beep-btn"
                    onClick={handleTestBeep}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all active:scale-98"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    Test Warning Beep
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* History Button */}
          <button
            id="view-history-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            title="Saved Body Scans & History"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Records</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Help / Guide */}
          <button
            id="open-guide-btn"
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
            title="BMI & Body Capture Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
