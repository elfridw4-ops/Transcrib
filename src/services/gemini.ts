import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TranscriptionSegment {
  start: string;
  end: string;
  text: string;
}

export interface TranscriptionResult {
  language: string;
  segments: TranscriptionSegment[];
  fullText: string;
}

export const transcribeVideo = async (fileBase64: string, mimeType: string): Promise<TranscriptionResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: [
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType,
        },
      },
      {
        text: "Transcribe this video. Detect the language. Provide the output in JSON format with 'language', 'fullText', and 'segments' (each segment with 'start', 'end' in HH:MM:SS,mmm format and 'text').",
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          fullText: { type: Type.STRING },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                start: { type: Type.STRING },
                end: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ["start", "end", "text"],
            },
          },
        },
        required: ["language", "fullText", "segments"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const translateTranscription = async (segments: TranscriptionSegment[]): Promise<TranscriptionSegment[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: `Translate the following transcription segments into French. Keep the same JSON structure with 'start', 'end', and 'text' (translated). \n\n ${JSON.stringify(segments)}`,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            start: { type: Type.STRING },
            end: { type: Type.STRING },
            text: { type: Type.STRING },
          },
          required: ["start", "end", "text"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};
