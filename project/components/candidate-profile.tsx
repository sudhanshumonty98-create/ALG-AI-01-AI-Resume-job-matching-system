'use client';

import {
  AlertTriangle, ShieldCheck, ShieldAlert, Target,
  CheckCircle2, XCircle, GraduationCap, Briefcase, User,
} from 'lucide-react';
import type { Candidate } from '@/lib/types';

export function CandidateProfile({ candidate }: { candidate: Candidate }) {
  const hasContradictions = candidate.contradictions.length > 0;

  return (
    <div className="border-t border-border/40 px-5 pb-6 pt-5 space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Match Summary</h4>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{candidate.summary}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Extracted Skills</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <div
                  key={skill.name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border ${
                    skill.match
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-border/40 bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  {skill.match ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {skill.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Experience</h4>
            </div>
            <div className="space-y-3">
              {candidate.experience.map((exp, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/40 bg-secondary/20">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{exp.title}</p>
                    <span className="text-xs text-muted-foreground">{exp.duration}</span>
                  </div>
                  <p className="text-xs text-primary mb-2">{exp.company}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Education</h4>
            </div>
            <div className="space-y-2">
              {candidate.education.map((edu, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium">{edu.degree}</p>
                    <p className="text-xs text-muted-foreground">{edu.school}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <FraudAudit contradictions={candidate.contradictions} />
          <InterviewProbes probes={candidate.interviewProbes} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Synergy Chart</h4>
        </div>
        <div className="rounded-lg border border-border/40 bg-card/30 p-2">
          <canvas id="synergyChart" style={{ width: '100%', height: '400px', display: 'block' }} />
        </div>
      </div>
    </div>
  );
}

function FraudAudit({ contradictions }: { contradictions: Candidate['contradictions'] }) {
  if (contradictions.length === 0) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-success" />
          <h4 className="text-sm font-bold text-success">Fraud Audit: Clear</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No contradictions detected. All claims in this resume are supported by documented experience.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          <h4 className="text-sm font-bold text-destructive">Contradictions Detected</h4>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-destructive/20 text-destructive animate-pulse">
          High Risk
        </span>
      </div>
      
      <div className="space-y-5">
        {contradictions.map((c, i) => (
          <div key={i} className="flex flex-col gap-2 relative">
            {/* The Claim */}
            <div className="p-3 rounded-lg border border-border/50 bg-background/80">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1 block">
                Claim on Resume
              </span>
              <p className="text-sm font-medium text-foreground">"{c.claim}"</p>
            </div>
            
            {/* Connecting visual element */}
            <div className="absolute left-6 top-[3.25rem] w-0.5 h-4 bg-destructive/30 z-0"></div>
            
            {/* The Reality */}
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 z-10">
              <span className="text-[10px] text-destructive uppercase font-bold tracking-wider mb-1 block">
                AI Audit Reality
              </span>
              <p className="text-sm text-foreground/90">{c.issue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterviewProbes({ probes }: { probes: Candidate['interviewProbes'] }) {
  if (!probes || probes.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h4 className="text-sm font-bold text-primary">Recruiter Cheat Sheet</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Ask these targeted questions to verify the candidate's actual depth of knowledge.
      </p>
      
      <div className="space-y-4">
        {probes.map((probe, i) => (
          <div key={i} className="p-4 rounded-lg border border-primary/20 bg-card/60 relative overflow-hidden">
            {/* Accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40"></div>
            
            <div className="flex items-start gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                Q{i + 1}
              </span>
              <p className="text-sm font-semibold text-foreground leading-snug mt-0.5">
                "{probe.question}"
              </p>
            </div>
            
            <div className="ml-9 p-2.5 rounded bg-background/50 border border-border/40">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                <Target className="w-3 h-3 inline mr-1 text-primary" />
                Target Intent
              </p>
              <p className="text-xs text-foreground/80 italic">
                {probe.intent}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
