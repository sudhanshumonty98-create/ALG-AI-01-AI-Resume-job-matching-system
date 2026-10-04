'use client';

import { useEffect, useState } from 'react';
import { ScanSearch, Brain, ShieldCheck, FileSearch } from 'lucide-react';

const STEPS = [
  { icon: FileSearch, label: 'Parsing job description requirements' },
  { icon: Brain, label: 'Extracting skills from candidate resumes' },
  { icon: ShieldCheck, label: 'Cross-referencing claims for contradictions' },
  { icon: ScanSearch, label: 'Generating surgical interview probes' },
];

export function ProcessingView() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 mb-6 animate-pulse-glow">
            <ScanSearch className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 glow-text text-primary">
            Running Forensic AI Audit
          </h2>
          <p className="text-muted-foreground text-sm">
            Analyzing resumes against job requirements with deep claim verification
          </p>
        </div>

        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-500 ${
                  isActive
                    ? 'border-primary/40 bg-primary/5 glow-border scan-line'
                    : isDone
                    ? 'border-border/40 bg-card/30 opacity-60'
                    : 'border-border/20 bg-card/20 opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-primary/15' : isDone ? 'bg-success/15' : 'bg-muted/30'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : isDone ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                </div>
                {isActive && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                {isDone && <ShieldCheck className="w-4 h-4 text-success" />}
              </div>
            );
          })}
        </div>

        <div className="mt-8 h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
            style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
