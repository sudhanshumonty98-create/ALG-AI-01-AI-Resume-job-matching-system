"use client";

import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SkillRadarProps {
  candidateSkills: number[]; // e.g., [90, 85, 20, 10, 80]
  jobRequirements: number[]; // e.g., [80, 80, 85, 60, 70]
  labels: string[]; // e.g., ['React', 'Node.js', 'Kubernetes', 'AWS', 'TypeScript']
}

export function SkillRadar({ candidateSkills, jobRequirements, labels }: SkillRadarProps) {
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Candidate Match',
        data: candidateSkills,
        backgroundColor: 'rgba(14, 165, 233, 0.4)', // Tailwind sky-500
        borderColor: '#0ea5e9',
        borderWidth: 2,
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0ea5e9',
        fill: true,
      },
      {
        label: 'Role Requirement',
        data: jobRequirements,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(156, 163, 175, 0.5)', // Tailwind gray-400
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: {
          color: '#94a3b8',
          font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' as const }
        },
        ticks: {
          display: false,
          max: 100,
          min: 0,
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#e2e8f0', usePointStyle: true, padding: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#38bdf8',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context:any) {
            const skillName = context.label;
            const score = context.raw;
            const datasetLabel = context.dataset.label;
            
            if (datasetLabel === 'Candidate Match') {
              if (score >= 80) return ` ✔ Validated: Strong evidence in work history.`;
              if (score > 40) return ` ⚠ Partial: Mentioned, but lacks deep project context.`;
              return ` ❌ High Risk: Claimed, but zero verifiable project evidence.`;
            }
            return ` Target Baseline: ${score}%`;
          }
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full h-[350px] p-4 bg-slate-900/50 rounded-xl border border-slate-800"
    >
      <div className="absolute inset-0 bg-sky-500/5 blur-3xl rounded-full -z-10 pointer-events-none" />
      <Radar data={data} options={options} />
    </motion.div>
  );
}