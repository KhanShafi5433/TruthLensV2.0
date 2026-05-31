import React, { useState, useRef } from "react";
import { ArrowLeft, QrCode, AlertTriangle, CheckCircle, ShieldAlert, Upload, Camera, X, Loader2 } from "lucide-react";
import { analyzeQRData, getQRWarningMessage } from "../services/qrScanner";
import { readImageFile } from "../utils/readImageFile";
import jsQR from "jsqr";

interface QRScannerScreenProps {
  onGoBack: () => void;
}

export default function QRScannerScreen({ onGoBack }: QRScannerScreenProps) {
  const [qrData, setQrData] = useState("");
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeQRData> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [qrDecodeError, setQrDecodeError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = () => {
    if (!qrData.trim()) return;

    setIsAnalyzing(true);
    setQrDecodeError("");
    setTimeout(() => {
      const result = analyzeQRData(qrData);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 500);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("QR Scanner: Image select triggered");
    const file = e.target.files?.[0];
    if (!file) {
      console.log("QR Scanner: No file selected");
      return;
    }

    console.log("QR Scanner: File selected:", file.name);
    try {
      const prepared = await readImageFile(file);
      console.log("QR Scanner: Image prepared successfully");
      setSelectedImage(file);
      setImagePreview(prepared.previewUrl);
      setQrDecodeError("");
      setAnalysisResult(null);
      setQrData("");

      // Decode QR code from image
      await decodeQRFromImage(prepared.base64);
    } catch (err) {
      console.error("QR Scanner: Error loading image:", err);
      setQrDecodeError("Failed to load image. Please try again.");
    }
  };

  const decodeQRFromImage = async (base64: string) => {
    setIsAnalyzing(true);
    setQrDecodeError("");

    try {
      // Create image element
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create canvas to extract image data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setQrData(code.data);
        // Automatically analyze the decoded QR data
        const result = analyzeQRData(code.data);
        setAnalysisResult(result);
      } else {
        setQrDecodeError("No QR code detected in this image. Please upload a valid QR code image.");
      }
    } catch (err) {
      console.error("Error decoding QR:", err);
      setQrDecodeError("Failed to decode QR code. Please try a clearer image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High Risk":
        return "text-red-400 border-red-500/30 bg-red-950/20";
      case "Suspicious":
        return "text-amber-400 border-amber-500/30 bg-amber-950/20";
      default:
        return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-[#05070A]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-[#05070A] border-b border-slate-900/40 flex items-center justify-between z-40 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={onGoBack}
            className="p-2.5 bg-slate-900/50 border border-slate-805 text-slate-350 hover:text-white rounded-2xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <QrCode className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              QR CODE SCANNER
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <h5 className="text-xs font-display font-semibold text-slate-200 uppercase tracking-wide">
            Scan QR Code
          </h5>
          <p className="text-[10px] text-slate-500">
            Upload a QR code image to automatically decode and analyze for safety.
          </p>
        </div>

        {/* Image Upload Area */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="qr-image-input"
          />
          
          {!imagePreview ? (
            <label
              htmlFor="qr-image-input"
              className="block w-full p-8 border-2 border-dashed border-slate-800 hover:border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer bg-slate-900/10 hover:bg-slate-950/30"
            >
              <QrCode className="w-8 h-8 text-slate-500" />
              <div className="text-center">
                <p className="text-xs text-slate-300 font-medium">Click to upload QR code image</p>
                <p className="text-[10px] text-slate-500 mt-1">Supports screenshots and photos</p>
              </div>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="QR Code Preview"
                  className="w-full rounded-2xl border border-slate-800"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview("");
                    setQrData("");
                    setAnalysisResult(null);
                    setQrDecodeError("");
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 rounded-full text-white cursor-pointer hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {qrDecodeError && (
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-300">{qrDecodeError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Text Input (Fallback) */}
        <div className="space-y-2">
          <h5 className="text-[10px] font-mono text-slate-500 uppercase">
            Or paste QR data manually
          </h5>
          <textarea
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            placeholder="Paste QR code data, UPI link, or URL here..."
            className="w-full p-4 bg-slate-900/50 border border-slate-800 focus:border-blue-500 rounded-2xl outline-none text-sm text-slate-200 resize-none h-24 placeholder:text-slate-700"
          />
          <button
            onClick={handleAnalyze}
            disabled={!qrData.trim() || isAnalyzing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                ANALYZING...
              </>
            ) : (
              "ANALYZE QR CODE"
            )}
          </button>
        </div>

        {analysisResult && (
          <div className="space-y-4">
            {/* Risk Level */}
            <div className={`p-4 border rounded-2xl ${getRiskColor(analysisResult.riskLevel)}`}>
              <div className="flex items-center gap-2 mb-2">
                {analysisResult.riskLevel === "High Risk" ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : analysisResult.riskLevel === "Suspicious" ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-bold uppercase">
                  {analysisResult.riskLevel}
                </span>
              </div>
              <p className="text-xs">{getQRWarningMessage(analysisResult)}</p>
            </div>

            {/* Type */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                Detected Type
              </h6>
              <p className="text-sm text-slate-200 font-bold">{analysisResult.type}</p>
            </div>

            {/* Risk Score */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                Risk Score
              </h6>
              <p className="text-2xl font-mono font-bold text-slate-200">
                {analysisResult.riskScore}%
              </p>
            </div>

            {/* Warnings */}
            {analysisResult.warnings.length > 0 && (
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                  Warnings
                </h6>
                <ul className="space-y-2">
                  {analysisResult.warnings.map((warning, index) => (
                    <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extracted URL */}
            {analysisResult.extractedUrl && (
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                  Extracted URL
                </h6>
                <p className="text-xs text-slate-300 break-all">{analysisResult.extractedUrl}</p>
              </div>
            )}

            {/* UPI Details */}
            {analysisResult.upiDetails && (
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                  UPI Payment Details
                </h6>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Payee Address:</span>
                    <p className="text-xs text-slate-300">{analysisResult.upiDetails.pa}</p>
                  </div>
                  {analysisResult.upiDetails.pn && (
                    <div>
                      <span className="text-[10px] text-slate-500">Payee Name:</span>
                      <p className="text-xs text-slate-300">{analysisResult.upiDetails.pn}</p>
                    </div>
                  )}
                  {analysisResult.upiDetails.am && (
                    <div>
                      <span className="text-[10px] text-slate-500">Amount:</span>
                      <p className="text-xs text-slate-300">{analysisResult.upiDetails.am} {analysisResult.upiDetails.cu || "INR"}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
