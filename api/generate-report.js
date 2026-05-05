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

    const { resumeData, jdData } = body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform a skill gap analysis.
        Candidate: ${JSON.stringify(resumeData)}
        Job Requirements: ${JSON.stringify(jdData)}
        
        Return ONLY raw JSON with these keys:
        "matchScore", "matchedSkills", "missingSkills", "recommendations",
        "roadmap": { "weeklyPlan", "milestones" },
        "courseSuggestions": [{ "title", "platform", "type", "reason", "urlHint" }],
        "skillAssessment": { "strongPoints", "mediumPoints", "weakPoints" },
        "categoryBreakdown": { "Technical", "Soft Skills", "Experience", "Education" }`,
    });

    const cleaned = (response.text ?? '{}').replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return res.status(200).json(JSON.parse(cleaned));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}