import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL_NAME = "gemini-2.5-flash";

export async function analyzeResumeText(text: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze the following resume text and extract key details. 
      IMPORTANT: Even if the resume is extremely brief or seems like a placeholder, do NOT fail. Infer core skills from any context available. If it's just a name, assume they are a candidate and provide a generalized analysis.
      
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

  return JSON.parse(response.text || '{}');
}

export async function analyzeJDText(jdText: string) {
  console.log('Analyzing JD Text...');
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze the following Job Description (JD) and extract requirements. 
      IMPORTANT: Even if the JD is short, do NOT return empty lists. Infer the standard skills usually associated with the job title mentioned. 
      
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

  return JSON.parse(response.text || '{}');
}

export async function generateBridgeReport(resumeData: any, jdData: any) {
  console.log('Generating Bridge Report...');
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Perform a comprehensive job skill gap analysis between a candidate's profile and a Job Description.
      
      Candidate Info: ${JSON.stringify(resumeData)}
      Job Requirements: ${JSON.stringify(jdData)}
      
      Your goal is to provide a roadmap to "bridge the gap". Even if there are very few details, provide a high-quality, professional gap analysis with specific suggestions.
      
      Return a JSON object with EXACTLY these keys:
      1. "matchScore": (number from 0-100)
      2. "matchedSkills": (list of strings)
      3. "missingSkills": (list of strings)
      4. "recommendations": (detailed list of actionable strings for resume/profile improvements. Provide at least 5 detailed points.)
      5. "roadmap": {
           "weeklyPlan": (list of 6-8 strings for week-by-week progress. Be specific.),
           "milestones": (list of 4-5 strings for major goals)
         }
      6. "courseSuggestions": (list of at least 5-8 objects: { 
           "title": string, 
           "platform": string (e.g., "Coursera", "Udemy", "Harvard CS50", "Google Career Certificates", "YouTube", "Medium", "O'Reilly", "Official Docs"), 
           "type": string (one of: "course", "article", "book", "video", "blog"),
           "reason": string, 
           "urlHint": string 
         })
      7. "skillAssessment": {
           "strongPoints": (list of objects: { "skill": string, "impact": string, "level": number (1-10) }),
           "mediumPoints": (list of objects: { "skill": string, "impact": string, "improvementNeeded": string, "currentProgress": number (percent 0-100) }),
           "weakPoints": (list of objects: { "skill": string, "impact": string, "improvementNeeded": string, "priority": "High" | "Medium" })
         }
      8. "categoryBreakdown": { "Technical": number, "Soft Skills": number, "Experience": number, "Education": number }
      
      Ensure the output is strictly valid JSON.`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
}
