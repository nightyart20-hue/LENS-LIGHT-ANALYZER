import { GoogleGenAI, Type } from "@google/genai";
import { PhotoAnalysis } from "../types";

export const analyzeMedia = async (base64Data: string, mimeTypeHint?: string): Promise<PhotoAnalysis> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Determine MimeType
  let mimeType = mimeTypeHint;
  
  // Fallback to data URL extraction if hint is missing or empty
  if (!mimeType) {
    const match = base64Data.match(/^data:([^;]+);/);
    mimeType = match ? match[1] : 'image/jpeg';
  }

  const isVideo = mimeType.startsWith("video/");

  // 2. Clean Base64
  // Ensure we strip the data URL prefix if it exists, otherwise use as is
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");

  // MASTER TEMPLATE: SINGLE SHOT GENERATION
  const prompt = `
    Analyze this ${isVideo ? "video clip" : "photograph"} as a Senior Cinematographer and Optical Physicist. 
    
    **TASK**: Generate a cohesive "Single Shot" metadata package.
    
    **STRICT OUTPUT RULES**:
    1. **Title**: Concise, commercial, descriptive (Max 10 words).
    2. **Keywords**: 20-30 highly relevant tags covering Subject, Lighting, Lens, and Mood.
    3. **Visual Description (MAX 700 WORDS)**:
       - **Format**: A single, dense, coherent paragraph.
       - **Content**: You MUST integrate specific details about:
         - **LENS**: Focal length feel, bokeh character (swirly, creamy, cat-eye), optical imperfections (chromatic aberration, vignette, soft edges).
         - **ATMOSPHERE**: Air density, haze, dust particles, humidity, color temperature.
         - **ANGLE**: Camera height, tilt, roll, and (if video) movement physics (weight, parallax).
         - **GEOMETRY**: Leading lines, framing balance, aspect ratio feel.
       - **TONE**: 100% Organic and Raw. Avoid "AI-sounding" adjectives like "breathtaking" or "symphony". Describe the *physics of the light*.
    
    4. **Technical Estimates**: Best guess settings for Camera, Lens, Aperture, Shutter, ISO.

    Return the result in strictly valid JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Flash model for high-speed automation
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType, 
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Commercial title, max 10 words.",
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "20-30 keywords.",
            },
            lens: {
              type: Type.STRING,
              description: "Specific lens characteristics (coating, distortion, sharp/soft).",
            },
            atmosphere: {
              type: Type.STRING,
              description: "Lighting physics and air quality.",
            },
            angle: {
              type: Type.STRING,
              description: "Camera position and movement dynamics.",
            },
            geometry: {
              type: Type.STRING,
              description: "Compositional structure.",
            },
            location: {
              type: Type.STRING,
              description: "Environment estimation.",
            },
            technicalParams: {
              type: Type.OBJECT,
              description: "Camera settings.",
              properties: {
                focalLength: { type: Type.STRING },
                aperture: { type: Type.STRING },
                iso: { type: Type.STRING },
                shutterSpeed: { type: Type.STRING },
                cameraType: { type: Type.STRING },
              },
              required: ["focalLength", "aperture", "iso", "shutterSpeed", "cameraType"]
            },
            visual_detail: {
              type: Type.OBJECT,
              description: "Detailed analysis.",
              properties: {
                visual_description: {
                  type: Type.STRING,
                  description: "MAX 700 WORDS. The detailed organic description.",
                },
                visual_anchors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific grounding elements (e.g. 'rust texture', 'lens flare').",
                },
                subjects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      features: { type: Type.STRING },
                    },
                    required: ["name", "description", "features"]
                  }
                }
              },
              required: ["visual_description", "visual_anchors", "subjects"]
            }
          },
          required: ["title", "keywords", "lens", "atmosphere", "angle", "geometry", "visual_detail", "location", "technicalParams"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text from Gemini.");
    }

    // Robust JSON extraction
    const firstBrace = resultText.indexOf('{');
    const lastBrace = resultText.lastIndexOf('}');
    
    let cleanJson = resultText;
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = resultText.substring(firstBrace, lastBrace + 1);
    } else {
       // Fallback cleanup if braces aren't clear but markdown exists
       cleanJson = resultText.replace(/```json\n?|\n?```/g, "").trim();
    }

    try {
       return JSON.parse(cleanJson) as PhotoAnalysis;
    } catch (parseError) {
       console.error("JSON Parse Error. Raw text:", resultText);
       throw new Error("Failed to process AI response. The model output was not valid JSON.");
    }

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};