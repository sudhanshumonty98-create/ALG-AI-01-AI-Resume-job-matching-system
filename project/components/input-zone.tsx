'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles, X, Plus, ScanSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface InputZoneProps {
  onAnalyze: (jobDescription: string, resumes: string[]) => void;
}

interface ResumeEntry {
  id: string;
  name: string;
  content: string;
}

export function InputZone({ onAnalyze }: InputZoneProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState<ResumeEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pastingMode, setPastingMode] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteName, setPasteName] = useState('');

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          setResumes((prev) => [
            ...prev,
            { id: Math.random().toString(36).slice(2), name: file.name, content },
          ]);
        };
        reader.readAsText(file);
      } else {
        toast.error(`${file.name} is not a text file`);
      }
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  function addPastedResume() {
    if (!pasteContent.trim()) {
      toast.error('Resume content is empty');
      return;
    }
    setResumes((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        name: pasteName.trim() || `Resume ${prev.length + 1}`,
        content: pasteContent,
      },
    ]);
    setPasteContent('');
    setPasteName('');
    setPastingMode(false);
  }

  function removeResume(id: string) {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }

  function handleRun() {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }
    if (resumes.length === 0) {
      toast.error('Please add at least one resume');
      return;
    }
    onAnalyze(jobDescription, resumes.map((r) => r.content));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ScanSearch className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Sentinel AI</h1>
              <p className="text-xs text-muted-foreground">Resume & Job Matching System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success/80 animate-pulse" />
            AI Engine Online
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Forensic Resume Analysis
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Audit Candidates Against Your Job Description
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Paste a job description, add candidate resumes, and run an AI-powered audit that surfaces
            skill matches, flags contradictory claims, and generates targeted interview probes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">1</div>
              <h3 className="font-semibold">Job Description</h3>
            </div>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here — including required skills, experience level, and responsibilities..."
              className="flex-1 min-h-[320px] resize-none bg-card/50 border-border/60 focus-visible:border-primary/50 text-sm leading-relaxed"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{jobDescription.trim().split(/\s+/).filter(Boolean).length} words</span>
              {jobDescription && (
                <button onClick={() => setJobDescription('')} className="hover:text-foreground transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">2</div>
                <h3 className="font-semibold">Candidate Resumes</h3>
              </div>
              <span className="text-xs text-muted-foreground">{resumes.length} added</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex-1 min-h-[200px] rounded-lg border-2 border-dashed transition-all p-4 ${
                dragOver
                  ? 'border-primary bg-primary/5 glow-border'
                  : 'border-border/60 bg-card/50'
              }`}
            >
              {resumes.length === 0 && !pastingMode ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                  <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drop resume files here</p>
                    <p className="text-xs text-muted-foreground mt-1">.txt or .md files supported</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Browse Files
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPastingMode(true)}>
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      Paste Text
                    </Button>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".txt,.md,text/plain"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>
              ) : pastingMode ? (
                <div className="flex flex-col h-full gap-3">
                  <input
                    type="text"
                    value={pasteName}
                    onChange={(e) => setPasteName(e.target.value)}
                    placeholder="Candidate name (optional)"
                    className="px-3 py-2 rounded-md border border-border/60 bg-background/50 text-sm focus-visible:border-primary/50 outline-none"
                  />
                  <Textarea
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Paste resume text here..."
                    className="flex-1 min-h-[120px] resize-none bg-background/50 border-border/60 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => { setPastingMode(false); setPasteContent(''); setPasteName(''); }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={addPastedResume}>
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add Resume
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 h-full">
                  <div className="flex-1 overflow-auto space-y-2">
                    {resumes.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-md border border-border/40 bg-secondary/30 group hover:border-border/70 transition-colors">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.content.trim().split(/\s+/).length} words</p>
                        </div>
                        <button
                          onClick={() => removeResume(r.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    <Button size="sm" variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Add More
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPastingMode(true)}>
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      Paste Text
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <Button
            size="lg"
            onClick={handleRun}
            disabled={!jobDescription.trim() || resumes.length === 0}
            className="px-10 py-6 text-base font-semibold gap-2.5 animate-pulse-glow disabled:animate-none"
          >
            <ScanSearch className="w-5 h-5" />
            Run AI Audit
          </Button>
        </div>
      </main>
    </div>
  );
}
