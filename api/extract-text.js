import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileData, mimeType } = req.body;

    if (!fileData || !mimeType) {
      return res.status(400).json({ error: "fileData and mimeType are required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: fileData,
          mimeType: mimeType
        }
      },
      "Extract all skills from this resume. Return as JSON."
    ]);

    const text = result.response.text();
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
