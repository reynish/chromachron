"use client";

import { useState } from 'react';
import ColorDatePicker from '@/components/color-date-picker';

export default function Home() {
  const [hexColor, setHexColor] = useState<string>('#240101');

  return (
    <main 
      className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 transition-colors duration-500"
      style={{ backgroundColor: hexColor || 'hsl(var(--background))' }}
    >
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tighter" style={{ color: hexColor ? 'white' : 'hsl(var(--foreground))' }}>
            ChromaChron
          </h1>
        </header>
        <ColorDatePicker hexColor={hexColor} setHexColor={setHexColor} />
      </div>
    </main>
  );
}
