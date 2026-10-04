'use client';

import { useState } from 'react';
import { InputZone } from '@/components/input-zone';
import { ProcessingView } from '@/components/processing-view';
import { ResultsDashboard } from '@/components/results-dashboard';
import type { AnalyzeResponse } from '@/lib/types';

type View = 'input' | 'processing' | 'results';

export default function Home() {
  const [view, setView] = useState<View>('input');
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [jobDescription, setJobDescription] = useState('');

  async function handleAnalyze(jd: string, resumes: string[]) {
    setJobDescription(jd);
    setView('processing');
    try {
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, resumes }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data: AnalyzeResponse = await res.json();
      setResults(data);
      setView('results');
    } catch {
      setView('input');
    }
  }

  if (view === 'processing') {
    return <ProcessingView />;
  }

  if (view === 'results' && results) {
    return (
      <ResultsDashboard
        results={results}
        jobDescription={jobDescription}
        onReset={() => {
          setResults(null);
          setView('input');
        }}
      />
    );
  }

  return <InputZone onAnalyze={handleAnalyze} />;
}
