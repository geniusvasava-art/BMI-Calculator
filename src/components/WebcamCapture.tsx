import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  CameraOff, 
  RotateCw, 
  RotateCcw,
  Timer, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Download,
  AlertCircle,
  FlipHorizontal,
  Scan,
  AlertTriangle,
  Ruler,
  ExternalLink,
  ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';
import { soundSynthesizer } from '../utils/audio';
import { ImageBMIAnalysis } from '../types';

interface WebcamCaptureProps {
  onCapture: (dataUrl: string) => void;
  capturedImage: string | null;
  onClearCapture: () => void;
  onCameraStatusChange?: (active: boolean) => void;
  isAnalyzingImage?: boolean;
  imageAnalysis?: ImageBMIAnalysis | null;
  onReanalyzeImage?: () => void;
  onApplyHeight?: (heightCm: number) => void;
}

export function WebcamCapture({
  onCapture,
  capturedImage,
  onClearCapture,
  onCameraStatusChange,
  isAnalyzingImage = false,
  imageAnalysis = null,
  onReanalyzeImage,
  onApplyHeight,
}: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mirror, setMirror] = useState<boolean>(true);
  const [showSilhouette, setShowSilhouette] = useState<boolean>(true);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [selectedTimer, setSelectedTimer] = useState<0 | 3 | 5>(3);
  const [aspectRatio, setAspectRatio] = useState<'4:3' | '16:9' | '3:4'>('4:3');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [showHeightRuler, setShowHeightRuler] = useState<boolean>(true);

  // Initialize camera
  const startCamera = async (deviceId?: string) => {
    setIsLoading(true);
    setCameraError(null);
    setIsPermissionDenied(false);

    // Stop existing stream tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported in this browser environment.');
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr: unknown) {
        // If ideal resolution or exact device fails, attempt standard video fallback
        console.warn('Primary camera constraints failed, attempting fallback { video: true }...', firstErr);
        newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }

      onCameraStatusChange?.(true);

      // Enumerate camera devices
      const allDevices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err: unknown) {
      console.error('Camera stream error:', err);
      let errMsg = 'Unable to access webcam.';
      let permissionBlocked = false;

      if (err instanceof Error) {
        if (
          err.name === 'NotAllowedError' || 
          err.name === 'PermissionDeniedError' ||
          err.message.toLowerCase().includes('permission') || 
          err.message.toLowerCase().includes('denied')
        ) {
          errMsg = 'Camera permission was denied or restricted by your browser.';
          permissionBlocked = true;
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errMsg = 'No camera device was detected on your hardware.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errMsg = 'Webcam is currently in use by another application or tab.';
        } else {
          errMsg = err.message;
        }
      }

      setIsPermissionDenied(permissionBlocked);
      setCameraError(errMsg);
      onCameraStatusChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onCameraStatusChange?.(false);
    };
  }, []);

  // Ensure video element always keeps stream attached and actively playing
  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [stream, capturedImage]);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startCamera(deviceId);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Verify stream is active
    if (!stream || !stream.active || stream.getVideoTracks().every((t) => t.readyState === 'ended')) {
      await startCamera(selectedDeviceId);
      return;
    }

    // Ensure video element has stream attached and is playing
    if (video.srcObject !== stream) {
      video.srcObject = stream;
      await video.play().catch(() => {});
    }
    if (video.paused) {
      await video.play().catch(() => {});
    }

    // Use native video resolution
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Optional stamp: date & body scan indicator
    if (mirror) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    
    // Shutter flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // Shutter sound
    soundSynthesizer.playShutterSound();

    onCapture(dataUrl);
  };

  const handleTriggerCapture = () => {
    // If an image was previously captured, clear it immediately to ensure live stream is ready
    if (capturedImage) {
      onClearCapture();
    }

    if (selectedTimer === 0) {
      captureFrame();
      return;
    }

    let count = selectedTimer;
    setCountdownSeconds(count);
    soundSynthesizer.playCountdownTick();

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownSeconds(count);
        soundSynthesizer.playCountdownTick();
      } else {
        clearInterval(interval);
        setCountdownSeconds(0);
        captureFrame();
      }
    }, 1000);
  };

  const handleClearAndResume = () => {
    onClearCapture();
    if (videoRef.current) {
      if (stream && videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onCapture(event.target.result as string);
        soundSynthesizer.playShutterSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadSnapshot = () => {
    if (!capturedImage) return;
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `body-capture-${new Date().toISOString().slice(0, 10)}.jpg`;
    a.click();
  };

  const openInNewTab = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch (e) {
      console.warn(e);
    }
  };

  const loadSampleDemoPhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Neutral studio background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 800);

    // Studio floor grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let y = 680; y <= 800; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // Standing person silhouette with realistic anatomical proportions (~175cm / 70kg)
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    // Head
    ctx.beginPath();
    ctx.ellipse(320, 145, 42, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Neck
    ctx.fillRect(308, 195, 24, 25);

    // Torso & Shoulders
    ctx.beginPath();
    ctx.moveTo(220, 240);
    ctx.quadraticCurveTo(320, 220, 420, 240);
    ctx.lineTo(395, 360);
    ctx.quadraticCurveTo(405, 440, 400, 490);
    ctx.lineTo(240, 490);
    ctx.quadraticCurveTo(235, 440, 245, 360);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left Arm
    ctx.beginPath();
    ctx.moveTo(220, 240);
    ctx.lineTo(195, 360);
    ctx.lineTo(190, 460);
    ctx.lineTo(210, 460);
    ctx.lineTo(220, 360);
    ctx.lineTo(240, 250);
    ctx.closePath();
    ctx.fill();

    // Right Arm
    ctx.beginPath();
    ctx.moveTo(420, 240);
    ctx.lineTo(445, 360);
    ctx.lineTo(450, 460);
    ctx.lineTo(430, 460);
    ctx.lineTo(420, 360);
    ctx.lineTo(400, 250);
    ctx.closePath();
    ctx.fill();

    // Left Leg
    ctx.beginPath();
    ctx.moveTo(245, 490);
    ctx.lineTo(255, 620);
    ctx.lineTo(260, 735);
    ctx.lineTo(295, 735);
    ctx.lineTo(305, 620);
    ctx.lineTo(310, 490);
    ctx.closePath();
    ctx.fill();

    // Right Leg
    ctx.beginPath();
    ctx.moveTo(330, 490);
    ctx.lineTo(335, 620);
    ctx.lineTo(345, 735);
    ctx.lineTo(380, 735);
    ctx.lineTo(385, 620);
    ctx.lineTo(395, 490);
    ctx.closePath();
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCapture(dataUrl);
    soundSynthesizer.playShutterSound();
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col shadow-xl backdrop-blur-sm">
      {/* Card Header & Controls */}
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Webcam Body Scanner
            </h2>
            <p className="text-[11px] text-slate-400">
              Stand in frame &amp; align with the silhouette guide
            </p>
          </div>
        </div>

        {/* Framing & Camera Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Silhouette Toggle */}
          <button
            onClick={() => setShowSilhouette(!showSilhouette)}
            className={`p-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
              showSilhouette
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-700/60 text-slate-400 border-slate-600 hover:text-slate-200'
            }`}
            title="Toggle Body Framing Guide"
          >
            {showSilhouette ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Body Guide</span>
          </button>

          {/* Mirror Flip */}
          <button
            onClick={() => setMirror(!mirror)}
            className={`p-1.5 rounded-lg text-xs border transition-all ${
              mirror
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-700/60 text-slate-400 border-slate-600'
            }`}
            title="Flip / Mirror Camera Feed"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Aspect Ratio */}
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as '4:3' | '16:9' | '3:4')}
            className="bg-slate-700/80 text-slate-200 text-xs border border-slate-600 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
            title="Frame Aspect Ratio"
          >
            <option value="4:3">4:3 Standard</option>
            <option value="16:9">16:9 Widescreen</option>
            <option value="3:4">3:4 Full Body</option>
          </select>

          {/* Multiple Cameras selector if available */}
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="bg-slate-700/80 text-slate-200 text-xs border border-slate-600 rounded-lg px-2 py-1 max-w-[120px] truncate focus:outline-none focus:border-indigo-500"
            >
              {devices.map((device, i) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          )}

          {/* Reset for New Scan in header toolbar */}
          {capturedImage && (
            <button
              id="webcam-header-reset-btn"
              type="button"
              onClick={onClearCapture}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Reset captured image and start a new scan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div 
        className={`relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center transition-all ${
          aspectRatio === '16:9' ? 'aspect-video' : aspectRatio === '3:4' ? 'aspect-[3/4] max-h-[440px]' : 'aspect-[4/3] max-h-[400px]'
        }`}
      >
        {/* Flash Overlay when photo is snapped */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* Countdown Overlay */}
        {countdownSeconds > 0 && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-30 flex flex-col items-center justify-center animate-in zoom-in duration-200">
            <span className="text-7xl font-extrabold text-white tracking-tighter drop-shadow-lg scale-110 transition-transform">
              {countdownSeconds}
            </span>
            <span className="text-sm font-semibold text-indigo-300 mt-2 uppercase tracking-widest">
              Get Ready to Pose
            </span>
          </div>
        )}

        {/* Video Element is ALWAYS mounted so camera stream tracks never disconnect or unmount */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${mirror ? '-scale-x-100' : ''}`}
        />

        {/* Loading Spinner during initial camera start */}
        {isLoading && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-15">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-300 font-medium">Starting Webcam Stream...</p>
          </div>
        )}

        {/* Camera Permission / Access Error */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 z-25 p-5 text-center flex flex-col items-center justify-center overflow-y-auto">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 border ${
              isPermissionDenied 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {isPermissionDenied ? <ShieldAlert className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
            </div>

            <h3 className="text-sm font-bold text-white mb-1">
              {isPermissionDenied ? 'Camera Permission Needed' : 'Webcam Access Notice'}
            </h3>

            <p className="text-xs text-slate-300 max-w-sm mb-3">
              {cameraError}
            </p>

            {isPermissionDenied && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 mb-3.5 max-w-sm text-left">
                <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> How to allow camera in browser:
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li>Click <strong>"Allow & Turn On Camera"</strong> below to trigger the prompt.</li>
                  <li>Check the <strong>lock/camera icon</strong> in your browser address bar and set Camera to <strong>Allow</strong>.</li>
                  <li>In embedded preview iframes, click <strong>"Open in Full Tab"</strong>.</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <div className="flex items-center gap-2">
                <button
                  id="grant-camera-btn"
                  type="button"
                  onClick={() => startCamera(selectedDeviceId)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {isPermissionDenied ? 'Allow & Turn On' : 'Retry Camera'}
                </button>

                <button
                  id="open-app-tab-btn"
                  type="button"
                  onClick={openInNewTab}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer active:scale-95 transition-all"
                  title="Open in a direct browser tab for unobstructed permissions"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  Full Tab
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer active:scale-95 transition-all">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  id="use-sample-demo-btn"
                  type="button"
                  onClick={loadSampleDemoPhoto}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-emerald-500/40 cursor-pointer active:scale-95 transition-all"
                  title="Test height and body BMI analysis instantly with demo pose image"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Use Demo Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Human Body Framing Silhouette Overlay (Visible during live camera) */}
        {showSilhouette && !cameraError && !capturedImage && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-70">
            <svg
              viewBox="0 0 400 500"
              className="w-full h-full max-h-[92%] stroke-cyan-400 fill-cyan-400/5 transition-opacity"
              style={{ strokeDasharray: '6, 6', strokeWidth: 1.8 }}
            >
              {/* Head Oval */}
              <ellipse cx="200" cy="80" rx="38" ry="46" />
              
              {/* Neck */}
              <path d="M 185 125 L 185 145 M 215 125 L 215 145" />

              {/* Shoulders & Torso */}
              <path d="M 115 170 Q 185 145 200 145 Q 215 145 285 170" />
              <path d="M 115 170 L 130 300 Q 200 320 270 300 L 285 170" />

              {/* Chest / Rib Line */}
              <path d="M 140 220 Q 200 230 260 220" strokeWidth="1.2" strokeDasharray="3, 3" />
              {/* Waist / Hip Line */}
              <path d="M 135 270 Q 200 280 265 270" strokeWidth="1.2" strokeDasharray="3, 3" />

              {/* Lower body / Legs */}
              <path d="M 145 320 L 155 460" />
              <path d="M 255 320 L 245 460" />
              <path d="M 190 330 L 190 460 M 210 330 L 210 460" strokeDasharray="4, 4" strokeWidth="1.2" />

              {/* Vertical Center Axis */}
              <line x1="200" y1="20" x2="200" y2="480" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2, 4" opacity="0.6" />

              {/* Corner Targets */}
              <path d="M 30 40 L 50 40 M 30 40 L 30 60" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M 370 40 L 350 40 M 370 40 L 370 60" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M 30 460 L 50 460 M 30 460 L 30 440" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M 370 460 L 350 460 M 370 460 L 370 440" stroke="#38bdf8" strokeWidth="2.5" />
            </svg>

            {/* Subtitle guidance */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-cyan-200 border border-cyan-500/30 flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Stand 1.5 - 2 meters back for full posture
            </div>
          </div>
        )}

        {/* View State: Captured Image Result Overlay */}
        {capturedImage && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black group overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured Body Frame"
              className="w-full h-full object-contain"
            />

            {/* AI Vision Active Scan Line */}
            {isAnalyzingImage && (
              <div className="absolute inset-0 pointer-events-none z-30">
                {/* Horizontal scanner beam */}
                <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-2 shadow-2xl">
                  <Scan className="w-4 h-4 animate-spin text-cyan-400" />
                  Calculating Accurate BMI from Body Contours...
                </div>
              </div>
            )}

            {/* Top Bar Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 flex-wrap pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md text-slate-200 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Frame Captured
              </div>

              {/* Automatic Detected Height & Image BMI Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {imageAnalysis && (
                  <div className="bg-indigo-950/90 text-cyan-300 border border-cyan-500/50 px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auto Height:</span>
                    <span className="font-mono text-white font-black underline">
                      {imageAnalysis.heightEstimation?.estimatedHeightCm || imageAnalysis.estimatedHeightCm} cm
                    </span>
                    {imageAnalysis.heightEstimation?.heightFeetInches && (
                      <span className="text-slate-300 text-[11px] font-normal">
                        ({imageAnalysis.heightEstimation.heightFeetInches})
                      </span>
                    )}
                  </div>
                )}

                {imageAnalysis && (
                  <div className={`px-2.5 py-1 rounded-lg font-black text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md border ${
                    imageAnalysis.isHigh 
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/60 ring-1 ring-amber-500/40' 
                      : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
                  }`}>
                    {imageAnalysis.isHigh ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    Auto Image BMI: <span className="font-mono underline">{imageAnalysis.bmi.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Height Stature Caliper Overlay */}
            {imageAnalysis && showHeightRuler && (
              <div className="absolute inset-0 pointer-events-none z-15 flex select-none">
                {/* Left Stature Ruler Scale */}
                <div className="h-full w-24 pl-2 py-4 flex flex-col justify-between">
                  {/* Top Crown Stature */}
                  <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded border border-cyan-500/60 text-[10px] font-mono font-bold text-cyan-300 w-fit shadow-md">
                    <Ruler className="w-2.5 h-2.5 text-cyan-400" />
                    {imageAnalysis.heightEstimation?.estimatedHeightCm || imageAnalysis.estimatedHeightCm} cm
                  </div>
                  
                  {/* Vertical Caliper Bar with tick marks */}
                  <div className="flex-1 my-1 ml-2 w-2 border-r-2 border-cyan-400/70 relative flex flex-col justify-between py-1">
                    <div className="w-3 border-t-2 border-cyan-400" />
                    <div className="w-2 border-t border-cyan-400/50" />
                    <div className="w-3 border-t border-cyan-400" />
                    <div className="w-2 border-t border-cyan-400/50" />
                    <div className="w-3 border-t border-cyan-400" />
                    <div className="w-2 border-t border-cyan-400/50" />
                    <div className="w-3 border-t-2 border-cyan-400" />
                  </div>

                  {/* Ground Base */}
                  <div className="bg-slate-950/90 backdrop-blur-md px-1.5 py-0.5 rounded border border-slate-700 text-[9px] font-mono text-slate-400 w-fit">
                    0 cm (Base)
                  </div>
                </div>

                {/* Right horizontal landmark guidelines */}
                <div className="flex-1 h-full relative py-4 pointer-events-none">
                  {/* Head Crown Level */}
                  <div className="absolute top-[12%] left-0 right-4 border-b border-dashed border-cyan-400/70 flex items-center justify-end pr-2">
                    <span className="bg-cyan-950/90 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-cyan-500/40">
                      ▲ Crown ({imageAnalysis.heightEstimation?.estimatedHeightCm || imageAnalysis.estimatedHeightCm} cm)
                    </span>
                  </div>
                  {/* Shoulders Level */}
                  <div className="absolute top-[28%] left-0 right-8 border-b border-dotted border-indigo-400/50 flex items-center justify-end pr-2">
                    <span className="bg-indigo-950/90 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-indigo-500/40">
                      Shoulders
                    </span>
                  </div>
                  {/* Waist Level */}
                  <div className="absolute top-[52%] left-0 right-12 border-b border-dotted border-amber-400/50 flex items-center justify-end pr-2">
                    <span className="bg-amber-950/90 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-amber-500/40">
                      Waistline
                    </span>
                  </div>
                  {/* Base Level */}
                  <div className="absolute bottom-[6%] left-0 right-4 border-b border-dashed border-emerald-400/70 flex items-center justify-end pr-2">
                    <span className="bg-emerald-950/90 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-emerald-500/40">
                      ▼ Floor Base
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Landmark targets overlay if analyzed */}
            {imageAnalysis && !showHeightRuler && (
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-40">
                <svg viewBox="0 0 400 400" className="w-full h-full stroke-cyan-400 fill-none" strokeWidth="1.5">
                  <circle cx="200" cy="110" r="14" strokeDasharray="3,3" />
                  <line x1="140" y1="170" x2="260" y2="170" strokeDasharray="4,4" />
                  <line x1="150" y1="260" x2="250" y2="260" strokeDasharray="4,4" />
                </svg>
              </div>
            )}

            {/* Quick action overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20 flex-wrap">
              {imageAnalysis && (
                <button
                  id="toggle-height-caliper-btn"
                  type="button"
                  onClick={() => setShowHeightRuler(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer transition-all active:scale-95 ${
                    showHeightRuler 
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60' 
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-600'
                  }`}
                  title="Toggle Visual Height Caliper Overlay"
                >
                  <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{showHeightRuler ? 'Hide Ruler' : 'Show Height Ruler'}</span>
                </button>
              )}
              {imageAnalysis && onApplyHeight && (
                <button
                  id="apply-detected-height-overlay-btn"
                  type="button"
                  onClick={() => onApplyHeight(imageAnalysis.heightEstimation?.estimatedHeightCm || imageAnalysis.estimatedHeightCm)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold border border-emerald-400/40 flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all active:scale-95"
                  title="Apply this auto-detected height to the calculator"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Apply Height ({imageAnalysis.heightEstimation?.estimatedHeightCm || imageAnalysis.estimatedHeightCm} cm)
                </button>
              )}
              <button
                id="capture-next-overlay-btn"
                type="button"
                onClick={handleTriggerCapture}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold border border-indigo-400/40 flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all active:scale-95"
                title="Capture next image for new person/scan"
              >
                <Camera className="w-3.5 h-3.5" />
                Capture Next Image
              </button>
              <button
                id="reset-new-scan-overlay-btn"
                type="button"
                onClick={handleClearAndResume}
                className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-600 flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer transition-all active:scale-95"
                title="Return to live camera"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                Live Camera
              </button>
              {onReanalyzeImage && (
                <button
                  type="button"
                  onClick={onReanalyzeImage}
                  disabled={isAnalyzingImage}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-600 flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition-all cursor-pointer"
                  title="Recalculate BMI from this image"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                  Re-analyze
                </button>
              )}
              <button
                id="download-snapshot-btn"
                type="button"
                onClick={handleDownloadSnapshot}
                className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-medium border border-slate-600 flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Save Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shutter & Capture Bar */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        {/* Timer selector */}
        <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-700/80">
          <span className="text-[11px] text-slate-400 px-2 font-medium flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            Delay:
          </span>
          {([0, 3, 5] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTimer(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedTimer === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t === 0 ? 'Instant' : `${t}s`}
            </button>
          ))}
        </div>

        {/* Main Capture Shutter Button */}
        <div className="flex items-center gap-2">
          {!capturedImage ? (
            <button
              id="webcam-capture-shutter-btn"
              onClick={handleTriggerCapture}
              disabled={isLoading || Boolean(cameraError)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              Capture Body Image
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="capture-next-image-btn"
                onClick={handleTriggerCapture}
                disabled={isLoading || Boolean(cameraError)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
                title="Capture next image for new person/scan"
              >
                <Camera className="w-4 h-4" />
                Capture Next Image
              </button>
              <button
                id="reset-for-new-scan-btn"
                onClick={handleClearAndResume}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                title="Return to live camera preview"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                Live Camera / Retake
              </button>
            </div>
          )}

          {/* Alternative File Upload */}
          <label className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer" title="Upload image file from PC">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
