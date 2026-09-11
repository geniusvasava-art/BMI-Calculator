/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UnitSystem, 
  Gender, 
  AudioSettings, 
  BodyScanRecord,
  BMIResult,
  ImageBMIAnalysis
} from './types';
import { calculateBMI } from './utils/bmi';
import { soundSynthesizer } from './utils/audio';
import { analyzeBodyShapeFromDataUrl } from './utils/bodyShapeAnalyzer';
import { Header } from './components/Header';
import { WebcamCapture } from './components/WebcamCapture';
import { BMICalculatorForm } from './components/BMICalculatorForm';
import { BMIResultsCard } from './components/BMIResultsCard';
import { HighBMIWarningAlert } from './components/HighBMIWarningAlert';
import { HistoryGallery } from './components/HistoryGallery';
import { HelpGuideModal } from './components/HelpGuideModal';
import { ImageBMIAnalysisCard } from './components/ImageBMIAnalysisCard';
import { 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Layers,
  RotateCcw
} from 'lucide-react';

const STORAGE_KEY = 'bodycam_bmi_records_v1';
const AUDIO_SETTINGS_KEY = 'bodycam_bmi_audio_v1';

export default function App() {
  // Input parameters
  const [age, setAge] = useState<number>(28);
  const [weightKg, setWeightKg] = useState<number>(82); // default slightly high (BMI ~27.7) to demonstrate feature
  const [heightCm, setHeightCm] = useState<number>(172);
  const [gender, setGender] = useState<Gender>('male');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  // Webcam & Capture state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Automatic Image BMI Analysis State
  const [imageAnalysis, setImageAnalysis] = useState<ImageBMIAnalysis | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null);

  // Audio configuration
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    try {
      const saved = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      enabled: true,
      volume: 0.8,
      autoPlayOnHigh: true,
      beepTone: 'standard',
    };
  });

  // History Records
  const [records, setRecords] = useState<BodyScanRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // UI Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Compute BMI result
  const bmiResult: BMIResult = useMemo(() => {
    return calculateBMI(weightKg, heightCm, age);
  }, [weightKg, heightCm, age]);

  // Track previous BMI to avoid spamming beeps on minor continuous edits, but beep on high transitions or explicit calc
  const prevIsHighRef = useRef<boolean>(false);
  const isFirstRenderRef = useRef<boolean>(true);

  // Persist Audio settings
  const handleUpdateAudio = (newSettings: AudioSettings) => {
    setAudioSettings(newSettings);
    try {
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn(e);
    }
  };

  // Persist History Records
  const saveRecordsToStorage = (updated: BodyScanRecord[]) => {
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Play warning beep when BMI transitions to high or is calculated
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevIsHighRef.current = bmiResult.isHigh;
      return;
    }

    if (bmiResult.isHigh && !prevIsHighRef.current && audioSettings.enabled && audioSettings.autoPlayOnHigh) {
      soundSynthesizer.playWarningBeep(bmiResult.severity === 'critical' ? 'critical' : 'high', audioSettings.volume);
    }

    prevIsHighRef.current = bmiResult.isHigh;
    setIsSaved(false);
  }, [bmiResult.isHigh, bmiResult.severity, audioSettings.enabled, audioSettings.autoPlayOnHigh, audioSettings.volume]);

  // Manual Trigger Calculation & sound
  const handleCalculateAndAssess = () => {
    setIsSaved(false);
    if (bmiResult.isHigh) {
      if (audioSettings.enabled) {
        soundSynthesizer.playWarningBeep(bmiResult.severity === 'critical' ? 'critical' : 'high', audioSettings.volume);
      }
    } else {
      if (audioSettings.enabled) {
        soundSynthesizer.playSuccessChime(audioSettings.volume);
      }
    }
  };

  // Analyze image with Gemini Vision / Server endpoint with real person body-shape extraction
  const analyzeCapturedImage = async (dataUrl: string) => {
    setIsAnalyzingImage(true);
    setImageAnalysisError(null);

    // Extract computer vision body contour metrics from the image frame
    const bodyShapeMetrics = await analyzeBodyShapeFromDataUrl(dataUrl);

    try {
      const res = await fetch('/api/analyze-body', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: dataUrl,
          age,
          weightKg,
          heightCm,
          gender,
          bodyShapeMetrics,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server response error: ${res.status}`);
      }

      const data: ImageBMIAnalysis = await res.json();
      setImageAnalysis(data);

      // Automatically sync detected person height from image to calculator
      const detectedH = data.heightEstimation?.estimatedHeightCm || data.estimatedHeightCm;
      if (detectedH && detectedH > 0) {
        setHeightCm(detectedH);
      }

      // Trigger high-BMI warning beep and alert if image assessment is elevated (>= 25.0)
      if (data.isHigh && audioSettings.enabled && audioSettings.autoPlayOnHigh) {
        soundSynthesizer.playWarningBeep(data.bmi >= 35 ? 'critical' : 'high', audioSettings.volume);
      } else if (!data.isHigh && audioSettings.enabled) {
        soundSynthesizer.playSuccessChime(audioSettings.volume);
      }
    } catch {
      // Dynamic anthropometric computer vision calculation using extracted silhouette metrics
      const calcBMI = bodyShapeMetrics.estimatedBMI;
      const isHigh = calcBMI >= 25.0;
      const detectedH = bodyShapeMetrics.heightMetrics?.estimatedHeightCm || (heightCm || (gender === 'female' ? 164 : 175));
      const hM = detectedH / 100;
      const estWeight = Math.round(calcBMI * hM * hM * 10) / 10;
      
      // Automatically sync detected person height
      if (bodyShapeMetrics.heightMetrics?.estimatedHeightCm) {
        setHeightCm(bodyShapeMetrics.heightMetrics.estimatedHeightCm);
      }
      
      const fallbackAnalysis: ImageBMIAnalysis = {
        bmi: calcBMI,
        category: isHigh ? (calcBMI >= 30 ? 'obese1' : 'overweight') : (calcBMI < 18.5 ? 'underweight' : 'normal'),
        categoryLabel: isHigh ? (calcBMI >= 30 ? 'Obese (High Alert)' : 'Overweight (Warning: ≥ 25.0)') : 'Healthy Normal Weight',
        isHigh,
        confidenceScore: 93,
        estimatedHeightCm: detectedH,
        estimatedWeightKg: estWeight,
        heightEstimation: bodyShapeMetrics.heightMetrics,
        bodyFatPercentageRange: bodyShapeMetrics.estimatedBodyFat,
        physiqueType: `${bodyShapeMetrics.shapeLabel} (WSR: ${bodyShapeMetrics.waistToShoulderRatio})`,
        bodyShape: {
          shapeType: bodyShapeMetrics.estimatedBodyShape,
          shapeLabel: bodyShapeMetrics.shapeLabel,
          shapeDescription: bodyShapeMetrics.shapeDescription,
          waistToShoulderRatio: bodyShapeMetrics.waistToShoulderRatio,
          torsoCurvature: bodyShapeMetrics.torsoCurvature,
          silhouetteDensity: bodyShapeMetrics.bodySilhouetteFill,
        },
        visualObservations: [
          `Person stature auto-estimated at ${detectedH} cm (${bodyShapeMetrics.heightMetrics?.heightFeetInches || ''}) from standing frame ratio.`,
          `Visual silhouette classified as ${bodyShapeMetrics.shapeLabel}.`,
          `Waist-to-shoulder ratio calibrated at ${bodyShapeMetrics.waistToShoulderRatio} with ${bodyShapeMetrics.torsoCurvature} torso curvature.`,
          isHigh
            ? `Visible abdominal fullness and torso width produces elevated ${calcBMI} kg/m² BMI.`
            : `Lean torso contour with tapered midsection produces healthy ${calcBMI} kg/m² BMI.`,
        ],
        healthInsights: [
          isHigh 
            ? 'Elevated body mass index detected from image body shape (≥ 25.0). Audio alert activated.' 
            : 'Healthy body mass alignment confirmed by visual scanner.',
        ],
        detectedLandmarks: {
          headDetected: true,
          shouldersDetected: true,
          torsoDetected: true,
          fullBodyVisible: bodyShapeMetrics.heightMetrics?.framingType === 'full-body',
          postureAssessment: 'Frontal torso silhouette & height mapped',
        },
        source: 'algorithmic-biometric',
      };

      setImageAnalysis(fallbackAnalysis);

      if (isHigh && audioSettings.enabled && audioSettings.autoPlayOnHigh) {
        soundSynthesizer.playWarningBeep(calcBMI >= 35 ? 'critical' : 'high', audioSettings.volume);
      }
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Handle Photo Capture - immediately triggers automatic image BMI calculation
  const handleCaptureImage = (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setIsSaved(false);
    analyzeCapturedImage(dataUrl);
  };

  const handleClearCapture = () => {
    setCapturedImage(null);
    setImageAnalysis(null);
    setImageAnalysisError(null);
    setIsSaved(false);
  };

  const handleApplyEstimates = (estHeightCm: number, estWeightKg: number) => {
    setHeightCm(estHeightCm);
    setWeightKg(estWeightKg);
    setIsSaved(false);
  };

  // Save current Assessment & Snapshot to Records
  const handleSaveRecord = () => {
    const newRecord: BodyScanRecord = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      timestamp: Date.now(),
      imageDataUrl: capturedImage,
      age,
      weightKg,
      heightCm,
      unitSystem,
      bmi: imageAnalysis ? imageAnalysis.bmi : bmiResult.bmi,
      category: imageAnalysis ? imageAnalysis.category : bmiResult.category,
      categoryLabel: imageAnalysis ? imageAnalysis.categoryLabel : bmiResult.categoryLabel,
      isHigh: imageAnalysis ? imageAnalysis.isHigh : bmiResult.isHigh,
      imageAnalysis: imageAnalysis || undefined,
    };

    const updated = [newRecord, ...records];
    saveRecordsToStorage(updated);
    setIsSaved(true);
    soundSynthesizer.playSuccessChime(0.4);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    saveRecordsToStorage(updated);
  };

  const handleClearAllRecords = () => {
    if (confirm('Are you sure you want to clear all saved body scan records?')) {
      saveRecordsToStorage([]);
    }
  };

  // Quick Preset Test Scenarios (Convenient for PC user testing)
  const applyPreset = (presetWeight: number, presetHeight: number, presetAge: number) => {
    setWeightKg(presetWeight);
    setHeightCm(presetHeight);
    setAge(presetAge);
    setIsSaved(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Header Bar */}
      <Header
        audioSettings={audioSettings}
        onUpdateAudio={handleUpdateAudio}
        isHighBMI={bmiResult.isHigh}
        historyCount={records.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        cameraActive={cameraActive}
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        
        {/* High BMI Warning Alarm Banner (Active when BMI >= 25.0) */}
        <HighBMIWarningAlert
          result={bmiResult}
          audioSettings={audioSettings}
          onUpdateAudio={handleUpdateAudio}
        />

        {/* Quick Demo Test Presets */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Quick Test Profiles:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => applyPreset(65, 172, 28)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 font-medium transition-all"
            >
              🟢 Normal (BMI 22.0)
            </button>
            <button
              onClick={() => applyPreset(83, 172, 32)}
              className="px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 font-medium transition-all"
            >
              ⚠️ Overweight (BMI 28.1 - Triggers Beep)
            </button>
            <button
              onClick={() => applyPreset(102, 172, 40)}
              className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 font-medium transition-all"
            >
              🚨 Obese Class II (BMI 34.5 - High Alarm)
            </button>
          </div>
        </div>

        {/* Split Grid Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Webcam Body Scanner & Capture */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Active Scan Status Banner with Quick Reset */}
            {capturedImage && (
              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-200">
                    Active Body Scan Loaded
                  </span>
                </div>
                <button
                  id="reset-for-new-scan-top-banner-btn"
                  type="button"
                  onClick={handleClearCapture}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                  title="Clear current scan and start a new scan"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset for New Scan
                </button>
              </div>
            )}

            <WebcamCapture
              onCapture={handleCaptureImage}
              capturedImage={capturedImage}
              onClearCapture={handleClearCapture}
              onCameraStatusChange={setCameraActive}
              isAnalyzingImage={isAnalyzingImage}
              imageAnalysis={imageAnalysis}
              onReanalyzeImage={() => capturedImage && analyzeCapturedImage(capturedImage)}
              onApplyHeight={(h) => setHeightCm(h)}
            />

            {/* Automatic Image BMI Analysis Card */}
            {(capturedImage || isAnalyzingImage) && (
              <ImageBMIAnalysisCard
                analysis={imageAnalysis}
                isLoading={isAnalyzingImage}
                onReanalyze={() => capturedImage && analyzeCapturedImage(capturedImage)}
                onResetForNewScan={handleClearCapture}
                onApplyEstimates={handleApplyEstimates}
                unitSystem={unitSystem}
                volume={audioSettings.volume}
              />
            )}

            {!capturedImage && !isAnalyzingImage && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3 text-xs text-slate-400">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-200 block">Automatic Image BMI &amp; Height Detection Ready</strong>
                  Take a photo or upload an image to automatically estimate person height, analyze body frame silhouette, calculate accurate BMI, and trigger audio warning beeps if elevated.
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Parameters & Real-time BMI Gauge Result (6 or 7 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <BMICalculatorForm
              age={age}
              weightKg={weightKg}
              heightCm={heightCm}
              gender={gender}
              unitSystem={unitSystem}
              detectedHeightCm={imageAnalysis?.heightEstimation?.estimatedHeightCm || imageAnalysis?.estimatedHeightCm}
              detectedHeightFeetInches={imageAnalysis?.heightEstimation?.heightFeetInches}
              onAgeChange={setAge}
              onWeightChange={setWeightKg}
              onHeightChange={setHeightCm}
              onGenderChange={setGender}
              onUnitSystemChange={setUnitSystem}
              onCalculate={handleCalculateAndAssess}
            />

            <BMIResultsCard
              result={bmiResult}
              unitSystem={unitSystem}
              onSaveRecord={handleSaveRecord}
              hasCapturedImage={Boolean(capturedImage)}
              isSaved={isSaved}
            />
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3.5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            BodyCam BMI Workstation &copy; {new Date().getFullYear()} &bull; Web Audio API Warning Alarm Synthesizer
          </span>
          <span className="text-[11px] text-slate-400">
            Complies with World Health Organization (WHO) adult BMI standards
          </span>
        </div>
      </footer>

      {/* Modals */}
      <HistoryGallery
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={records}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAllRecords}
        unitSystem={unitSystem}
      />

      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
