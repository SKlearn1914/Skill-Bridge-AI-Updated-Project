export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

export interface ResumeData {
  id?: string;
  userId: string;
  fileName: string;
  rawText: string;
  technicalSkills: string[];
  softSkills: string[];
  experience: number;
  education: string;
  createdAt: string;
}

export interface JDData {
  requiredTechnicalSkills: string[];
  requiredSoftSkills: string[];
  minExperience: number;
  qualifications: string[];
}

export interface AnalysisReport {
  id?: string;
  userId: string;
  resumeId: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  roadmap: {
    weeklyPlan: string[];
    milestones: string[];
  };
  courseSuggestions: {
    title: string;
    platform: string;
    type?: 'course' | 'article' | 'book' | 'video' | 'blog';
    reason: string;
    urlHint?: string;
  }[];
  skillAssessment?: {
    strongPoints: Array<{ skill: string; impact: string; level: number }>;
    mediumPoints: Array<{ skill: string; impact: string; improvementNeeded: string; currentProgress: number }>;
    weakPoints: Array<{ skill: string; impact: string; improvementNeeded: string; priority: 'High' | 'Medium' }>;
  };
  categoryBreakdown?: {
    [key: string]: number;
  };
  createdAt: string;
}
