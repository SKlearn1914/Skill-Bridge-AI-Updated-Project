import { GoogleGenAI } from "@google/genai";

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }

    const { fileData, mimeType } = body;
    if (!fileData || !mimeType) {
      return res.status(400).json({ error: "fileData and mimeType are required" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { data: fileData, mimeType } },
        { text: "Extract all text content from this resume. Return the raw text only." }
      ],
    });

    return res.status(200).json({ result: response.text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
