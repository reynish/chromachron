"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { validateDate } from "@/ai/flows/date-validator-flow";

type ColorDatePickerProps = {
  hexColor: string;
  setHexColor: (color: string) => void;
};

export default function ColorDatePicker({ hexColor, setHexColor }: ColorDatePickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentYearDigits, setCurrentYearDigits] = useState<number>(0);
  const [aiReason, setAiReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    setCurrentYearDigits(new Date().getFullYear() % 100);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const { width, height } = canvas;

    const topLeft = { r: 0, g: 0, b: 0 };
    const topRight = { r: 255, g: 0, b: 0 };
    const bottomLeft = { r: 0, g: 255, b: 0 };
    const bottomRight = { r: 0, g: 0, b: 255 };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tx = x / width;
        const ty = y / height;

        const rTop = topLeft.r * (1 - tx) + topRight.r * tx;
        const rBottom = bottomLeft.r * (1 - tx) + bottomRight.r * tx;
        const r = rTop * (1 - ty) + rBottom * ty;

        const gTop = topLeft.g * (1 - tx) + topRight.g * tx;
        const gBottom = bottomLeft.g * (1 - tx) + bottomRight.g * tx;
        const g = gTop * (1 - ty) + gBottom * ty;

        const bTop = topLeft.b * (1 - tx) + topRight.b * tx;
        const bBottom = bottomLeft.b * (1 - tx) + bottomRight.b * tx;
        const b = bTop * (1 - ty) + bBottom * ty;

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  const handleCanvasClick = async (event: MouseEvent<HTMLCanvasElement>) => {
    if (currentYearDigits === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = pixelData;
    
    const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);
    const clickedHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
    const yy = Math.round((r / 255) * 99);
    const mm = Math.round((g / 255) * 11) + 1;
    const dd = Math.round((b / 255) * 30) + 1;

    if (mm < 1 || mm > 12) {
      toast({
        variant: "destructive",
        title: "Invalid Date",
        description: `The selected color maps to an invalid month.`,
      });
      return;
    }
    
    const fullYear = yy <= currentYearDigits ? 2000 + yy : 1900 + yy;
    
    const daysInMonth = new Date(fullYear, mm, 0).getDate();
    if (dd < 1 || dd > daysInMonth) {
       toast({
        variant: "destructive",
        title: "Invalid Date",
        description: `The selected color maps to an invalid day for the chosen month.`,
      });
      return;
    }

    const newDate = new Date(fullYear, mm - 1, dd);
    setSelectedDate(newDate);
    setHexColor(clickedHex);
    
    setIsLoading(true);
    setAiReason("");
    try {
      const result = await validateDate({ date: newDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) });
      setAiReason(result.reason);
    } catch (error) {
      console.error("AI validation error:", error);
      setAiReason("Could not get a reason from our AI historian.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : "Pick a color to begin";

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardHeader>
        <CardTitle>Color to Date</CardTitle>
        <CardDescription>Click on the gradient to select a date.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <canvas
          ref={canvasRef}
          width="500"
          height="500"
          className="w-full h-auto aspect-[10/3] rounded-md cursor-pointer border"
          onClick={handleCanvasClick}
          aria-label="Color gradient for date selection"
        />

        <div className="text-center mt-6 min-h-[80px]">
          {hexColor ? (
            <div key={hexColor} className="animate-in fade-in-50 duration-500 flex flex-col justify-around items-center gap-4">
              <div className="flex items-center justify-center gap-4">
                  <p className="text-lg text-white font-bold bg-primary/90 rounded-lg p-3" style={{ backgroundColor: hexColor }}>
                    {formattedDate}
                  </p>
                  <p className="text-lg text-black font-mono tracking-widest font-bold">
                    {hexColor}
                  </p>
              </div>
              <div className="text-sm text-muted-foreground italic w-full max-w-sm min-h-[40px]">
                {isLoading ? (
                  <p>Our AI historian is thinking...</p>
                ) : (
                  aiReason && <p>"{aiReason}"</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full pt-8">
              <p className="text-muted-foreground">Pick a color from the canvas to generate a date.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-center p-6 bg-muted/50">

      </CardFooter>
    </Card>
  );
}
