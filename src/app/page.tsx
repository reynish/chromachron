"use client";

import { useState } from 'react';
import ColorDatePicker from '@/components/color-date-picker';

export function getContrastColor(hex: string) {
  if (!hex) {
    return 'hsl(var(--foreground))';
  }

  const hexValue = hex.substring(1); // remove #
  if (hexValue.length !== 6) {
    return '#FFFFFF'; // default to white for invalid hex
  }
  
  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);

  // Using the luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default function Home() {
  const [hexColor, setHexColor] = useState<string>('#700101');
  const titleColor = getContrastColor(hexColor);

  return (
    <main 
      className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 transition-colors duration-500"
      style={{ backgroundColor: hexColor || 'hsl(var(--background))' }}
    >
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tighter" style={{ color: titleColor }}>
            ChromaChron
          </h1>
        </header>
        <ColorDatePicker hexColor={hexColor} textColor={titleColor} setHexColor={setHexColor} />
      </div>
    </main>
  );
}
