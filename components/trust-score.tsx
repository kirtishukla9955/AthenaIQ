"use client";

import { useEffect, useState } from "react";

interface TrustScoreProps {
  score: number;
  maxScore?: number;
}

export function TrustScore({ score, maxScore = 100 }: TrustScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = (animatedScore / maxScore) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = score / 60;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, 16);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center">
      <h3 className="font-mono text-sm text-muted mb-6 uppercase tracking-wider">
        Trust Score
      </h3>

      <div className="relative w-52 h-52">
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0, 123, 255, 0.3) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="url(#azureGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.5s ease-out",
              filter: "drop-shadow(0 0 10px rgba(0, 123, 255, 0.8))",
            }}
          />
          <defs>
            <linearGradient id="azureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#007BFF" />
              <stop offset="100%" stopColor="#00BFFF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-sentient text-foreground">
            {animatedScore}
          </span>
          <span className="text-sm font-mono text-muted mt-1">/ {maxScore}</span>
        </div>
      </div>

      <p className="font-mono text-xs text-muted mt-6 text-center">
        Verified on-chain integrity
      </p>
    </div>
  );
}
