const safeParseJSON = (text: string) => {
  const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
  return JSON.parse(cleaned);
};

export async function analyzeResumeText(text: string) {
  const response = await fetch('/api/extract-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await response.json();
  return typeof data.result === 'string' ? safeParseJSON(data.result) : data;
}

export async function analyzeJDText(jdText: string) {
  const response = await fetch('/api/analyze-jd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jdText }),
  });
  return response.json();
}

export async function generateBridgeReport(resumeData: any, jdData: any) {
  const response = await fetch('/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, jdData }),
  });
  return response.json();
}
