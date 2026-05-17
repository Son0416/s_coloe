/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from "react";
import { Upload, Camera, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Palette, User, Shirt, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AnalysisResult {
  disclaimer: string;
  summary: string;
  tone_direction: "warm" | "cool" | "neutral";
  season_type: string;
  sub_type: string;
  confidence: number;
  analysis: {
    skin_tone: string;
    brightness: string;
    saturation: string;
    contrast: string;
    overall_impression: string;
  };
  recommended_colors: { name: string; hex: string; reason: string }[];
  avoid_colors: { name: string; hex: string; reason: string }[];
  makeup_recommendations: {
    lip: string[];
    blush: string[];
    eyeshadow: string[];
  };
  hair_recommendations: string[];
  fashion_recommendations: string[];
  style_tip: string;
  photo_quality_note: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(",")[1];
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!response.ok) throw new Error("분석에 실패했습니다. 다시 시도해 주세요.");
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-ink font-sans">
      <header className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="w-7 h-7 text-natural-accent" />
          <h1 className="text-2xl font-serif font-semibold tracking-tight">ColorMatch AI</h1>
        </div>
        {image && (
          <button 
            onClick={reset}
            className="text-sm font-medium text-natural-sage hover:opacity-70 transition-opacity flex items-center gap-2"
          >
            이미지 초기화 <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {!image ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 text-center"
          >
            <h2 className="text-5xl md:text-6xl font-serif mb-8 leading-[1.1]">
              고유의 <span className="italic font-light text-natural-accent">아름다움</span>을 <br />
              <span className="font-semibold">발견하는 시간</span>
            </h2>
            <p className="text-lg text-gray-500 mb-16 max-w-xl mx-auto leading-relaxed">
              AI가 분석하는 당신만의 퍼스널 컬러. <br />
              가장 자연스럽고 조화로운 스타일을 제안해 드립니다.
            </p>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer max-w-sm mx-auto aspect-[3/4] rounded-[180px] border border-gray-200 bg-white shadow-sm flex flex-col items-center justify-center gap-6 hover:border-natural-accent hover:shadow-xl hover:shadow-natural-accent/10 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-natural-bg/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 p-5 rounded-full bg-natural-bg group-hover:bg-white transition-colors shadow-inner">
                <Camera className="w-10 h-10 text-gray-400 group-hover:text-natural-accent" />
              </div>
              <div className="relative z-10 text-center">
                <p className="font-serif text-xl font-medium">사진 업로드</p>
                <p className="text-sm text-gray-400 mt-2">클릭하여 시작하세요</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400 font-medium font-serif italic">
              <div className="flex items-center gap-2">정면 응시</div>
              <div className="flex items-center gap-2">자연광 조명</div>
              <div className="flex items-center gap-2">노메이크업 권장</div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {!result && !analyzing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-sm mx-auto"
              >
                <div className="relative aspect-[3/4] rounded-[180px] overflow-hidden shadow-2xl mb-12 border-8 border-white">
                  <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={handleAnalyze}
                  className="w-full py-6 rounded-full bg-natural-ink text-white font-serif text-lg font-medium flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all shadow-xl shadow-natural-ink/20 active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5 text-natural-accent" />
                  분석 시작하기
                </button>
              </motion.div>
            )}

            {analyzing && (
              <div className="flex flex-col items-center justify-center py-32 gap-8">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-natural-accent/30"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-t-2 border-natural-accent"
                  />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif mb-3 italic">고유의 색채를 탐색하고 있습니다</p>
                  <p className="text-gray-400 text-sm tracking-widest uppercase">Analyzing your natural tones</p>
                </div>
              </div>
            )}

            {error && (
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4 text-red-600">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">오류가 발생했습니다</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-12"
              >
                {/* Profile Section (Left) */}
                <div className="md:col-span-4 flex flex-col items-center text-center">
                  <div className="relative w-full aspect-[3/4] rounded-[180px] overflow-hidden mb-10 shadow-lg border border-black/5">
                    <img src={image} alt="Target" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="inline-flex items-center px-6 py-2 rounded-full bg-natural-accent text-white text-sm font-semibold mb-4 shadow-md shadow-natural-accent/20">
                    {result.season_type.split(' ').slice(0, -1).join(' ') || 'Personal Color'}
                  </div>
                  
                  <h2 className="text-5xl font-serif font-bold mb-3 leading-tight text-natural-ink">
                    {result.season_type.split(' ').pop()}
                  </h2>
                  <p className="text-2xl font-serif italic text-natural-accent mb-12">
                    {result.sub_type}
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    {[
                      { label: "피부 톤", value: result.analysis.skin_tone },
                      { label: "명도/채도", value: (result.analysis.brightness.split(' ')[0] || '') + ' ' + (result.analysis.saturation.split(' ')[0] || '') },
                      { label: "대비감", value: result.analysis.contrast },
                      { label: "이미지", value: result.analysis.overall_impression },
                    ].map((item, i) => (
                      <div key={i} className="bg-natural-card p-5 rounded-[24px] shadow-sm border-b-3 border-natural-accent/10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-medium leading-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="w-full mt-10 p-8 rounded-[32px] bg-natural-tip border-l-4 border-natural-sage text-left">
                    <p className="text-xs font-bold text-natural-sage uppercase tracking-widest mb-2">Beauty Key</p>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {result.makeup_recommendations.lip[0]} 컬러와 {result.makeup_recommendations.blush[0]} 블러셔가 최고의 조화를 이룹니다. 자연스러운 생기를 강조하세요.
                    </p>
                  </div>
                </div>

                {/* Analysis Section (Right) */}
                <div className="md:col-span-8 space-y-12">
                  <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-sm font-bold text-natural-sage uppercase tracking-[0.2em]">Consultant's Note</p>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Consistency</p>
                        <p className="text-xl font-serif">{(result.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-natural-ink">
                      "{result.summary}"
                    </p>
                    <p className="mt-8 text-sm leading-relaxed text-gray-500 border-t border-gray-100 pt-8 italic">
                      {result.style_tip}
                    </p>
                  </div>

                  {/* Colors */}
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-natural-sage uppercase tracking-widest">Best Palette (추천 컬러)</p>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {result.recommended_colors.map((color, i) => (
                          <div key={i} className="group relative">
                            <div 
                              className="w-full aspect-square rounded-2xl shadow-sm border border-black/5 transform transition-transform group-hover:scale-105"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-natural-ink text-white text-[10px] px-2 py-1 rounded-md -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                              {color.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-red-800 uppercase tracking-widest opacity-60">Worst Colors (워스트 컬러)</p>
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                        {result.avoid_colors.map((color, i) => (
                          <div key={i} className="w-full aspect-square rounded-xl shadow-sm border border-black/5 opacity-80"
                               style={{ backgroundColor: color.hex }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Makeup & Hair</p>
                      <div className="flex flex-wrap gap-2">
                        {[...result.makeup_recommendations.lip, ...result.makeup_recommendations.blush, ...result.hair_recommendations].map((tag, i) => (
                          <span key={i} className="px-4 py-2 bg-natural-tag rounded-xl text-sm font-medium text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fashion Styling</p>
                      <div className="flex flex-wrap gap-2">
                        {result.fashion_recommendations.map((tag, i) => (
                          <span key={i} className="px-4 py-2 bg-natural-tag rounded-xl text-sm font-medium text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-10 rounded-[40px] bg-natural-tip border-l-8 border-natural-sage">
                    <p className="text-sm font-bold text-natural-sage uppercase tracking-[0.2em] mb-4">Styling Recommendation</p>
                    <p className="text-base leading-relaxed text-gray-700">
                      당신의 피부 톤은 {result.analysis.skin_tone} 특징을 가지고 있으며, {result.analysis.brightness}과/와 {result.analysis.saturation}이 인상적입니다. {result.fashion_recommendations[0]} 소재의 의류를 매칭하여 더욱 세련된 무드를 연출해 보세요.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="md:col-span-12 text-center py-16 border-t border-natural-tag mt-8">
                  <p className="text-xs text-gray-400 italic max-w-2xl mx-auto leading-relaxed">
                    {result.disclaimer}. {result.photo_quality_note}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
