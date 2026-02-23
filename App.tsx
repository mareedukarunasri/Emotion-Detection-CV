
import React, { useState, useCallback, useRef } from 'react';
import { Upload, Camera, AlertCircle, RefreshCcw, User, Smile, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { analyzeEmotions } from './services/geminiService';
import { AnalysisResponse, UploadedImage, FaceDetection } from './types';
import FaceCanvas from './components/FaceCanvas';
import EmotionChart from './components/EmotionChart';

const App: React.FC = () => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage({
          file,
          preview: event.target?.result as string
        });
        setResult(null);
        setError(null);
        setSelectedFaceIndex(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.preview.split(',')[1];
      const analysis = await analyzeEmotions(base64Data);
      setResult(analysis);
      if (analysis.faces.length > 0) {
        setSelectedFaceIndex(0);
      }
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Please try a different image or check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setSelectedFaceIndex(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedFace = selectedFaceIndex !== null ? result?.faces[selectedFaceIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Brain size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">SentientVision</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Technology</a>
            <button 
              onClick={reset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!image ? (
          /* Hero / Upload State */
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
              Decode Human Emotions with <br />
              <span className="text-blue-600">Advanced AI Vision</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload any photo and our Gemini-powered engine will detect faces and analyze micro-expressions with clinical accuracy.
            </p>

            <div 
              className="bg-white p-8 md:p-12 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-blue-50/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Drop your image here</h3>
                <p className="text-slate-500 mb-6">Supports JPG, PNG, WEBP (Max 10MB)</p>
                <div className="flex gap-4">
                  <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all">
                    Choose File
                  </button>
                  <button className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2">
                    <Camera size={18} />
                    Camera
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Smile className="text-green-500" />, title: "Emotion Mapping", desc: "Detects 20+ nuanced facial states" },
                { icon: <Sparkles className="text-amber-500" />, title: "High Precision", desc: "Powered by Gemini 3 Flash Vision" },
                { icon: <User className="text-blue-500" />, title: "Multi-Face Support", desc: "Analyze groups and crowds instantly" }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">{feature.icon}</div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800">{feature.title}</h4>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Analysis View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Image Display */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                <FaceCanvas 
                  imageSrc={image.preview} 
                  faces={result?.faces || []} 
                  onFaceSelect={setSelectedFaceIndex}
                  selectedIndex={selectedFaceIndex}
                />
              </div>
              
              {!result && !isAnalyzing && (
                <button 
                  onClick={processImage}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
                >
                  <Brain size={24} />
                  Analyze Emotions
                </button>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                  <AlertCircle size={20} />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {result && (
                <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-100 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles size={20} />
                      Overall Atmosphere
                    </h3>
                    <p className="opacity-90 leading-relaxed text-lg italic">
                      "{result.overallAtmosphere}"
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain size={120} />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Results & Analytics */}
            <div className="lg:col-span-5 space-y-6">
              {isAnalyzing ? (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                      <Brain size={32} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Expressions...</h3>
                  <p className="text-slate-500 max-w-xs">Scanning facial landmarks and cross-referencing emotion patterns.</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Face Selector (if multiple) */}
                  {result.faces.length > 1 && (
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 overflow-x-auto">
                      <div className="flex gap-3">
                        {result.faces.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedFaceIndex(i)}
                            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all ${
                              selectedFaceIndex === i 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Face {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Face Detail */}
                  {selectedFace && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4">
                      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                            Subject Analysis
                          </span>
                          <div className="flex gap-4 text-sm font-medium text-slate-500">
                            {selectedFace.apparentAge && (
                              <span className="flex items-center gap-1">
                                <User size={14} /> {selectedFace.apparentAge} yrs
                              </span>
                            )}
                            {selectedFace.genderEstimate && (
                              <span className="flex items-center gap-1">
                                <ChevronRight size={14} className="text-slate-300" /> {selectedFace.genderEstimate}
                              </span>
                            )}
                          </div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Detected Emotions</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">
                          {selectedFace.summary}
                        </p>
                      </div>

                      <div className="p-8">
                        <EmotionChart emotions={selectedFace.emotions} />
                        
                        <div className="mt-8 space-y-4">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Confidence Breakdown</h4>
                          {selectedFace.emotions.slice(0, 3).map((e, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="font-bold text-slate-700">{e.label.charAt(0).toUpperCase() + e.label.slice(1)}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                                    style={{ width: `${e.confidence * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-blue-600">{Math.round(e.confidence * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={reset}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl"
                  >
                    <RefreshCcw size={20} />
                    New Analysis
                  </button>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready for Insights?</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Upload an image and click analyze to see the AI emotional mapping.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
              <Brain size={14} />
            </div>
            <span className="font-bold text-slate-800">SentientVision AI</span>
          </div>
          <p className="text-slate-500 text-sm">Powered by Gemini 3.0 • Advanced Facial Biometrics • Emotion Recognition Lab</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
