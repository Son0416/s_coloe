import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/analyze", async (req, res) => {
  try {
    const { image } = req.body; // base64 string without data:image/... prefix

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: image,
      },
    };

    const prompt = `너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.
사용자가 업로드한 얼굴 사진을 바탕으로 퍼스널컬러를 분석해줘. 단, 사진의 조명, 화장, 필터, 카메라 색감에 따라 결과가 달라질 수 있으므로 최종 진단이 아니라 참고용 분석으로 안내해줘.

분석 결과는 반드시 요청된 JSON 형식으로만 응답해줘. 마크다운, 설명 문장, 코드블록은 사용하지 마.

{
  "disclaimer": "사진 기반 분석은 조명, 화장, 필터, 카메라 색감에 따라 달라질 수 있으며 참고용 결과입니다.",
  "summary": "한 줄 요약",
  "tone_direction": "warm | cool | neutral",
  "season_type": "봄 웜톤 | 여름 쿨톤 | 가을 웜톤 | 겨울 쿨톤 | 중립톤",
  "sub_type": "세부 타입 (예: 봄 웜 라이트, 가을 웜 딥 등)",
  "confidence": 0.0 ~ 1.0 사이의 수치,
  "analysis": {
    "skin_tone": "피부 톤 분석 (밝기, 노란기/붉은기/푸른기, 맑은/차분한 느낌)",
    "brightness": "명도 분석",
    "saturation": "채도 분석",
    "contrast": "대비감 분석",
    "overall_impression": "전체 인상 분석 (부드러운/선명한 이미지)"
  },
  "recommended_colors": [
    {
      "name": "색상명",
      "hex": "#FFFFFF",
      "reason": "추천 이유"
    }
  ],
  "avoid_colors": [
    {
      "name": "색상명",
      "hex": "#FFFFFF",
      "reason": "피하면 좋은 이유"
    }
  ],
  "makeup_recommendations": {
    "lip": ["추천 립 컬러"],
    "blush": ["추천 블러셔 컬러"],
    "eyeshadow": ["추천 아이섀도우 컬러"]
  },
  "hair_recommendations": ["추천 헤어 컬러"],
  "fashion_recommendations": ["추천 의류 컬러"],
  "style_tip": "스타일링 팁",
  "photo_quality_note": "사진 품질에 따른 분석 한계"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Failed to generate analysis");
    }

    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
