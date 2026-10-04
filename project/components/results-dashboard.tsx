'use client';

import { SkillRadar } from '@/components/skill-radar';
import { useState } from 'react';
import { ArrowLeft, ScanSearch, Trophy, AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CandidateProfile } from '@/components/candidate-profile';
import type { AnalyzeResponse, Candidate } from '@/lib/types';

interface ResultsDashboardProps {
  results: AnalyzeResponse;
  jobDescription: string;
  onReset: () => void;
}

export function ResultsDashboard({ results, onReset }: ResultsDashboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sorted = [...results.candidates].sort((a, b) => b.matchScore - a.matchScore);
  const topCandidate = sorted[0];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-20 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ScanSearch className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Audit Results</h1>
              <p className="text-xs text-muted-foreground">{sorted.length} candidates analyzed</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            New Audit
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-8">
        {topCandidate && (
          <div className="mb-8 p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Top Match</p>
              <p className="text-lg font-semibold">{topCandidate.name} — {topCandidate.matchScore}% match</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setExpandedId(topCandidate.id)}>
              View Profile
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {sorted.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              rank={index + 1}
              expanded={expandedId === candidate.id}
              onToggle={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function CandidateCard({
  candidate,
  rank,
  expanded,
  onToggle,
}: {
  candidate: Candidate;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const matchedSkills = candidate.skills.filter((s) => s.match).length;
  const hasContradictions = candidate.contradictions.length > 0;
  const highSeverityCount = candidate.contradictions.filter((c) => c.severity === 'high').length;

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        expanded ? 'border-primary/40 bg-card/60' : 'border-border/40 bg-card/30 hover:border-border/70'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0 text-sm font-bold text-muted-foreground">
          #{rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{candidate.name}</h3>
            {hasContradictions && (
              <Badge variant="destructive" className="shrink-0 gap-1 text-[10px] px-2 py-0.5">
                <AlertTriangle className="w-3 h-3" />
                {highSeverityCount > 0 ? `${highSeverityCount} High Risk` : `${candidate.contradictions.length} Flag${candidate.contradictions.length > 1 ? 's' : ''}`}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{candidate.title}</p>
        </div>

        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Skills</p>
            <p className="text-sm font-medium">{matchedSkills}/{candidate.skills.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Flags</p>
            <p className={`text-sm font-medium ${hasContradictions ? 'text-destructive' : 'text-success'}`}>
              {candidate.contradictions.length}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <ScoreRing score={candidate.matchScore} />
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

    {expanded && (
        <div className="p-6 border-t border-border/40 space-y-6">
          <div className="bg-background/50 p-4 rounded-xl border border-border/50">
            <h4 className="text-sm font-semibold tracking-tight mb-2">Skill Synergy Radar</h4>
            
            <SkillRadar 
              labels={candidate.skills.map(s => typeof s === 'string' ? s : (s.name || 'Skill'))} 
              candidateSkills={candidate.skills.map(s => s.match ? 90 : 25)} 
              jobRequirements={candidate.skills.map(() => 80)} 
            />

          </div>
          <CandidateProfile candidate={candidate} />
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 85 ? 'text-success' : score >= 70 ? 'text-primary' : 'text-warning';
  const stroke = score >= 85 ? '#22c55e' : score >= 70 ? '#0ea5e9' : '#f59e0b';
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
        <circle
          cx="32" cy="32" r="28" fill="none" stroke={stroke} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>
        {score}
      </div>
    </div>
  );
}
