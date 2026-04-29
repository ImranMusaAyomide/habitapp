import React from 'react';

export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-green-500"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-lg">
          <img src="/icons/logo.svg" alt="Habit Tracker Logo" className="w-12 h-12" style={{ filter: 'brightness(0) saturate(100%) invert(60%) sepia(90%) saturate(600%) hue-rotate(90deg)' }} />
        </div>
        <h1
          className="text-4xl font-bold text-white mb-2"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Habit Tracker
        </h1>
        <p className="text-green-100 text-sm font-medium tracking-widest uppercase">
          Build better days
        </p>
      </div>
      <div className="mt-12">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full opacity-70 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
