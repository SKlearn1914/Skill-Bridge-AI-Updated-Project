import { GoogleGenAI } from "@google/genai";

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    let body = req.body;
    if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }

    const { jdText } = body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this Job Description and extract requirements.
        Return JSON with EXACTLY these keys:
        - "requiredTechnicalSkills": (list of strings)
        - "requiredSoftSkills": (list of strings)
        - "minimumYearsOfExperience": (number)
        - "preferredQualifications": (list of strings)
        
        Return ONLY raw JSON, no markdown.
        JD Text: ${jdText.substring(0, 15000)}`,
    });

    const cleaned = (response.text ?? '{}').replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return res.status(200).json(JSON.parse(cleaned));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}