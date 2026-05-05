import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

// Safe JSON parser - strips markdown code blocks
const safeParseJSON = (text: string) => {
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();
  return JSON.parse(cleaned);
};

export async function analyzeResumeText(text: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze the following resume text and extract key details. 
      IMPORTANT: Even if the resume is extremely brief or seems like a placeholder, do NOT fail. Infer core skills from any context available.
      
      Return a JSON object with EXACTLY these keys:
      - "technicalSkills": (list of strings)
      - "softSkills": (list of strings)
      - "yearsOfExperience": (number, default to 0 if unknown)
      - "education": (summary string, default to "Not specified" if unknown)
      
      Resume text: ${text.substring(0, 15000)}`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return safeParseJSON(response.text ?? '{}');  // ← fixed
}

export async function analyzeJDText(jdText: string) {
  console.log('Analyzing JD Text...');
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze the following Job Description and extract requirements. 
      IMPORTANT: Even if the JD is short, do NOT return empty lists. Infer standard skills associated with the job title.
      
      Return a JSON object with EXACTLY these keys:
      - "requiredTechnicalSkills": (list of strings)
      - "requiredSoftSkills": (list of strings)
      - "minimumYearsOfExperience": (number, default to 0)
      - "preferredQualifications": (list of strings)
      
      JD Text: ${jdText.substring(0, 15000)}`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return safeParseJSON(response.text ?? '{}');  // ← fixed
}

export async function generateBridgeReport(resumeData: any, jdData: any) {
  console.log('Generating Bridge Report...');
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Perform a comprehensive job skill gap analysis between a candidate's profile and a Job Description.
      
      Candidate Info: ${JSON.stringify(resumeData)}
      Job Requirements: ${JSON.stringify(jdData)}
      
      Return a JSON object with EXACTLY these keys:
      1. "matchScore": (number from 0-100)
      2. "matchedSkills": (list of strings)
      3. "missingSkills": (list of strings)
      4. "recommendations": (detailed list of at least 5 actionable strings)
      5. "roadmap": {
           "weeklyPlan": (list of 6-8 strings),
           "milestones": (list of 4-5 strings)
         }
      6. "courseSuggestions": (list of 5-8 objects: { 
           "title": string, 
           "platform": string, 
           "type": string,
           "reason": string, 
           "urlHint": string 
         })
      7. "skillAssessment": {
           "strongPoints": (list of objects: { "skill": string, "impact": string, "level": number }),
           "mediumPoints": (list of objects: { "skill": string, "impact": string, "improvementNeeded": string, "currentProgress": number }),
           "weakPoints": (list of objects: { "skill": string, "impact": string, "improvementNeeded": string, "priority": "High" | "Medium" })
         }
      8. "categoryBreakdown": { "Technical": number, "Soft Skills": number, "Experience": number, "Education": number }
      
      Return ONLY raw valid JSON. No markdown, no code blocks, no explanation.`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return safeParseJSON(response.text ?? '{}');  // ← fixed
}
