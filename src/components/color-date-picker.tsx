"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { validateDateWithGenAI } from "@/ai/flows/validate-date-with-gen-ai";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AIResponse = {
  isInPast: boolean;
  reason?: string;
};

export default function ColorDatePicker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hexColor, setHexColor] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentYearDigits, setCurrentYearDigits] = useState<number>(0);

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

    const topLeft = { r: 0, g: 1, b: 1 }; // Corresponds to #000101
    const topRight = { r: 153, g: 18, b: 49 }; // Corresponds to #991231
    const bottomLeft = { r: 80, g: 80, b: 80 }; // An arbitrary mid-grey
    const bottomRight = { r: 200, g: 200, b: 255 }; // A light blueish color

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tx = x / width;
        const ty = y / height;

        // Bilinear interpolation for each color channel
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

  useEffect(() => {
    if (!hexColor) return;

    const runValidation = async () => {
      setIsLoading(true);
      setAiResponse(null);
      try {
        const dateToValidate = hexColor.substring(1);
        const response = await validateDateWithGenAI({ date: dateToValidate });
        setAiResponse(response);
      } catch (error) {
        console.error("AI validation failed:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not validate the date. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    runValidation();
  }, [hexColor, toast]);

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (currentYearDigits === 0) return; // a small guard to ensure client is ready

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = pixelData;

    const yy = Math.floor((r / 255) * 100);
    const mm = Math.floor((g / 255) * 11) + 1; // 0-11 -> 1-12

    const fullYear = yy <= currentYearDigits ? 2000 + yy : 1900 + yy;

    const daysInMonth = new Date(fullYear, mm, 0).getDate();
    const dd = Math.floor((b / 255) * (daysInMonth -1)) + 1;

    // a quick guard against invalid dates.
    if (mm > 12 || dd > daysInMonth) {
      toast({
        variant: "destructive",
        title: "Invalid Date",
        description: "The selected color maps to an invalid date.",
      });
      return;
    }

    const newDate = new Date(fullYear, mm - 1, dd);
    setSelectedDate(newDate);

    const generatedHex = `#${String(yy).padStart(2, "0")}${String(mm).padStart(2, "0")}${String(dd).padStart(2, "0")}`;
    setHexColor(generatedHex);
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
          height="150"
          className="w-full h-auto aspect-[10/3] rounded-md cursor-pointer border"
          onClick={handleCanvasClick}
          aria-label="Color gradient for date selection"
        />

        <div className="text-center space-y-6 mt-6 min-h-[220px]">
            {hexColor ? (
                <div key={hexColor} className="animate-in fade-in-50 duration-500 space-y-4">
                    <h3 className="text-lg font-medium text-muted-foreground">Your Selected "Color"</h3>
                    <div className="flex items-center justify-center gap-4">
                        <div
                            className="w-12 h-12 rounded-md border-2"
                            style={{ backgroundColor: hexColor }}
                        />
                        <p className="text-2xl font-mono tracking-widest font-bold text-foreground">
                            {hexColor}
                        </p>
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground pt-4">Corresponds to the date:</h3>
                    <p className="text-3xl font-bold text-primary-foreground bg-primary/90 rounded-lg p-3">
                        {formattedDate}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full pt-8">
                    <p className="text-muted-foreground">Pick a color from the canvas to generate a date.</p>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="min-h-[90px] flex items-center justify-center p-6 bg-muted/50">
        {isLoading && <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />}
        {!isLoading && aiResponse?.isInPast && (
          <Alert variant="destructive" className="w-full animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Past Date Warning!</AlertTitle>
            <AlertDescription>{aiResponse.reason || "This date is in the past."}</AlertDescription>
          </Alert>
        )}
        {!isLoading && aiResponse && !aiResponse.isInPast && (
             <p className="text-sm text-muted-foreground">This date is in the future.</p>
        )}
        {!isLoading && !aiResponse && !hexColor && (
            <p className="text-sm text-muted-foreground">Validation result will appear here.</p>
        )}
      </CardFooter>
    </Card>
  );
}
