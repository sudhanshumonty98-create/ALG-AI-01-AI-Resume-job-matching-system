export interface Skill {
  name: string;
  match: boolean;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface ContradictionClaim {
  claim: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
}

export interface InterviewProbe {
  question: string;
  intent: string;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  email: string;
  matchScore: number;
  summary: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  contradictions: ContradictionClaim[];
  interviewProbes: InterviewProbe[];
}

export interface AnalyzeResponse {
  jobId: string;
  candidates: Candidate[];
}
