import { NextResponse } from 'next/server';
import type { AnalyzeResponse } from '@/lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- NEW: Live Data Fetcher ---
// Extracts a GitHub username from the resume text and fetches their live public repos
async function fetchLiveGitHubData(resumeText: string) {
  const githubRegex = /github\.com\/([a-zA-Z0-9_-]+)/i;
  const match = resumeText.match(githubRegex);
  
  if (!match) return "No GitHub profile linked on resume.";

  const username = match[1];
  try {
    // Fetch live repos from GitHub API (no API key needed for basic public requests)
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, {
      headers: { 'User-Agent': 'Sentinel-AI-Hackathon' }
    });
    
    if (!res.ok) return `GitHub profile found (${username}) but data could not be fetched.`;
    
    const repos = await res.json();
    if (repos.length === 0) return `GitHub profile (${username}) found, but has 0 public repositories.`;

    // Map into a clean string for Gemini to read
    const repoDetails = repos.map((r: any) => 
      `- ${r.name} (Language: ${r.language || 'Mixed/None'}, Stars: ${r.stargazers_count})`
    ).join('\n');

    return `LIVE GITHUB DATA FOR ${username}:\n${repoDetails}`;
  } catch (error) {
    return "Error fetching live GitHub data.";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const jobDescription: string = body.jobDescription ?? '';
    const resumes: string[] = body.resumes ?? [];

    if (!process.env.GEMINI_API_KEY || resumes.length === 0) {
      return NextResponse.json(getMockResponse());
    }

    // --- NEW: Fetch live data for all resumes concurrently ---
    const resumesWithLiveData = await Promise.all(
      resumes.map(async (resumeText, index) => {
        const liveGithub = await fetchLiveGitHubData(resumeText);
        return `--- RESUME ${index + 1} ---\n${resumeText}\n\n[REAL-TIME WEB DATA VERIFICATION]\n${liveGithub}`;
      })
    );

    const systemPrompt = `You are an elite Technical Recruiter and Forensic AI Agent.
Analyze the provided resumes against the job description. Extract deep structured data, detect contradictions, and look for timeline inconsistencies.

CRITICAL INSTRUCTION: You are provided with [REAL-TIME WEB DATA VERIFICATION] for candidates. 
You MUST cross-reference their resume claims against this live data. If they claim "5 years of React" but their live GitHub shows only Python, penalize them heavily and flag it as a High-Risk Contradiction.

SCORING & RANKING ALGORITHM (Strictly follow this to calculate matchScore 0-100):
1. Base Score: Start at 50 points if their baseline experience matches.
2. Tech Stack (+20 max): Add points for verified skill matches against the Job Description.
3. Live Data Verification (+15 max): Add points if their Live GitHub Data actually proves they code in the claimed languages.
4. Quantifiable Impact (+15 max): Add points for hard business metrics (e.g., "reduced latency by 40%").
5. Forensic Penalty (-10 to -50): Deduct massive points for contradictions, or if Live Data contradicts their resume claims.

You MUST respond with a single valid JSON object matching this exact TypeScript structure:
{
  "jobId": "job_${Math.random().toString(36).slice(2, 10)}",
  "candidates": [
    {
      "id": "c1",
      "name": "Candidate Full Name",
      "title": "Current or Best Fitting Professional Title",
      "email": "extracted or generated email",
      "matchScore": 85, 
      "summary": "Detailed evaluation justifying the matchScore, explicitly mentioning if live web data supported or contradicted their claims.",
      "skills": [ { "name": "Skill Name", "match": true } ],
      "education": [ { "degree": "Degree", "school": "University", "year": "Year" } ],
      "experience": [
        { "title": "Job Title", "company": "Company Name", "duration": "2021 — Present", "description": "Extract quantifiable achievements" }
      ],
      "contradictions": [
        { "claim": "Resume claim", "issue": "Why it is unverified (Reference the live data if applicable)", "severity": "high" }
      ],
      "interviewProbes": [
        { "question": "Question to test gap", "intent": "What this question verifies" }
      ]
    }
  ]
}`;

    const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\nRESUMES TO AUDIT:\n${resumesWithLiveData.join('\n\n')}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(userPrompt);
    const content = result.response.text();

    if (!content) throw new Error("Empty response from AI");

    const aiData: AnalyzeResponse = JSON.parse(content);
    return NextResponse.json(aiData);

  } catch (error) {
    console.error('Error processing resumes with Gemini:', error);
    return NextResponse.json(getMockResponse());
  }
}

// ... keep your getMockResponse function down here exactly as it was ...
function getMockResponse(): AnalyzeResponse {
  return {
    jobId: 'job_' + Math.random().toString(36).slice(2, 10),
    candidates: [
      {
        id: 'c1',
        name: 'Sarah Chen',
        title: 'Senior Full-Stack Engineer',
        email: 'sarah.chen@email.com',
        matchScore: 88,
        summary: 'Real-time footprint cross-referenced. High core frontend match (92%), but flagged for infrastructure claim discrepancies based on live repository auditing.',
        skills: [
          { name: 'React', match: true },
          { name: 'TypeScript', match: true },
          { name: 'Node.js', match: true },
          { name: 'Kubernetes', match: false },
        ],
        education: [{ degree: 'B.S. Computer Science', school: 'UC Berkeley', year: '2016' }],
        experience: [
          {
            title: 'Senior Full-Stack Engineer',
            company: 'TechFlow Inc.',
            duration: '2020 — Present',
            description: 'Led migration of monolithic app to microservices. Reduced API latency by 40%.',
          },
        ],
        contradictions: [
          {
            claim: 'Lists "Kubernetes" as a core production skill',
            issue: 'Live Code Audit: 0 Helm charts, Dockerfiles, or K8s manifests detected across public commit history. 95% of active code volume is client-side React.',
            severity: 'high',
          },
        ],
        interviewProbes: [
          {
            question: 'Your resume claims production Kubernetes pod orchestration, but repository footprints show zero container manifests. Can you walk me through the exact kubectl commands or CI/CD pipeline you used to deploy your last cluster?',
            intent: 'Tests if candidate actually configured K8s clusters or merely consumed an already-configured platform.',
          },
        ],
      },
    ],
  };
}