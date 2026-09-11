import { useState } from 'react';
import { 
  BodyScanRecord, 
  UnitSystem 
} from '../types';
import { 
  History, 
  Trash2, 
  Download, 
  Calendar, 
  User, 
  Weight, 
  Ruler, 
  Activity, 
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { kgToLbs } from '../utils/bmi';

interface HistoryGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  records: BodyScanRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  unitSystem: UnitSystem;
}

export function HistoryGallery({
  isOpen,
  onClose,
  records,
  onDeleteRecord,
  onClearAll,
  unitSystem,
}: HistoryGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Date', 'Age', 'Weight (kg)', 'Height (cm)', 'BMI', 'Category', 'High BMI Alert'];
    const rows = records.map((r) => [
      new Date(r.timestamp).toLocaleString(),
      r.age,
      r.weightKg,
      r.heightCm,
      r.bmi,
      r.categoryLabel,
      r.isHigh ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `body_mass_index_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Body Scan &amp; BMI History Log
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {records.length} records
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Track changes in body measurements and mass index over time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <>
                <button
                  id="export-csv-btn"
                  onClick={exportCSV}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Export CSV
                </button>
                <button
                  id="clear-all-history-btn"
                  onClick={onClearAll}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/40 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-3">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No Saved Records Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Capture a body snapshot from the webcam and calculate BMI, then click "Save Record" to store your results.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((rec) => {
                const displayWeight = unitSystem === 'metric' ? rec.weightKg : kgToLbs(rec.weightKg);
                const unitLabel = unitSystem === 'metric' ? 'kg' : 'lbs';

                return (
                  <div
                    key={rec.id}
                    className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex gap-3.5 hover:border-slate-600 transition-all shadow-md relative group"
                  >
                    {/* Thumbnail Image */}
                    {rec.imageDataUrl ? (
                      <div 
                        onClick={() => setSelectedPhoto(rec.imageDataUrl)}
                        className="w-24 h-28 rounded-lg overflow-hidden bg-black shrink-0 relative cursor-pointer border border-slate-700 hover:opacity-90"
                      >
                        <img
                          src={rec.imageDataUrl}
                          alt="Body Capture"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-28 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-slate-500 shrink-0 text-[10px] p-2 text-center">
                        <Activity className="w-5 h-5 mb-1 opacity-50" />
                        No Image
                      </div>
                    )}

                    {/* Record Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Date & High Tag */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(rec.timestamp).toLocaleDateString()} {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            rec.isHigh
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {rec.isHigh ? 'High Alert' : 'Normal'}
                          </span>
                        </div>

                        {/* BMI Big Stat */}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-black text-white font-mono">
                            {rec.bmi.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold">
                            {rec.categoryLabel}
                          </span>
                        </div>

                        {/* Parameters */}
                        <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Age</span>
                            <strong>{rec.age} y</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Weight</span>
                            <strong>{displayWeight} {unitLabel}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Height</span>
                            <strong>{rec.heightCm} cm</strong>
                          </div>
                        </div>

                        {/* AI Image Scan Badge if available */}
                        {rec.imageAnalysis && (
                          <div className="mt-2 text-[10px] bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 p-1.5 rounded-lg flex items-center justify-between">
                            <span>Image BMI: <strong>{rec.imageAnalysis.bmi.toFixed(1)}</strong></span>
                            <span className="text-cyan-300 font-mono">{rec.imageAnalysis.confidenceScore}% AI Confidence</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer actions */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => onDeleteRecord(rec.id)}
                          className="text-xs text-slate-400 hover:text-rose-400 p-1 rounded transition-colors flex items-center gap-1"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-2xl max-h-[85vh] relative">
            <img
              src={selectedPhoto}
              alt="Full Body Capture"
              className="max-h-[80vh] w-auto rounded-xl object-contain border border-slate-700 shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 bg-slate-900/80 text-white p-2 rounded-full border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
