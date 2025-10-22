"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { validateDate } from "@/ai/flows/date-validator-flow";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type ColorDatePickerProps = {
  hexColor: string;
  setHexColor: (color: string) => void;
};

export default function ColorDatePicker({ hexColor, setHexColor }: ColorDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [aiReason, setAiReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentYearDigits, setCurrentYearDigits] = useState<number>(0);

  const { toast } = useToast();

  useEffect(() => {
    setCurrentYearDigits(new Date().getFullYear() % 100);
  }, []);

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setHexColor(newColor);
    updateDateFromHex(newColor);
  };

  const updateDateFromHex = async (hex: string) => {
    if (currentYearDigits === 0) return;

    // Regex to filter for only numbers in the hex code
    const numericHex = hex.replace(/[^0-9]/g, '');
    if (numericHex.length !== 6) {
      setSelectedDate(null);
      setAiReason("");
      return;
    }

    const yy = parseInt(numericHex.substring(0, 2), 10);
    const mm = parseInt(numericHex.substring(2, 4), 10);
    const dd = parseInt(numericHex.substring(4, 6), 10);
    
    if (isNaN(yy) || isNaN(mm) || isNaN(dd)) {
      setSelectedDate(null);
      setAiReason("");
      return;
    }
    
    if (mm < 1 || mm > 12) {
      toast({
        variant: "destructive",
        title: "Invalid Date",
        description: `The selected color maps to an invalid month: ${mm}.`,
      });
      setSelectedDate(null);
      setAiReason("");
      return;
    }
    
    const fullYear = yy <= currentYearDigits ? 2000 + yy : 1900 + yy;
    
    const daysInMonth = new Date(fullYear, mm, 0).getDate();
    if (dd < 1 || dd > daysInMonth) {
       toast({
        variant: "destructive",
        title: "Invalid Date",
        description: `The selected color maps to an invalid day for the chosen month: ${dd}.`,
      });
      setSelectedDate(null);
      setAiReason("");
      return;
    }

    const newDate = new Date(fullYear, mm - 1, dd);
    setSelectedDate(newDate);
    
    setIsLoading(true);
    setAiReason("");
    try {
      const result = await validateDate({
        date: newDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        hexColor: `#${numericHex}`,
        year: yy,
        month: mm,
        day: dd,
      });
      setAiReason(result.reason);
    } catch (error) {
      console.error("AI validation error:", error);
      setAiReason("Could not get a reason from our AI historian.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hexColor.match(/^#[0-9]{6}$/)) {
      updateDateFromHex(hexColor);
    } else {
      setSelectedDate(null);
      setAiReason("");
    }
  }, [currentYearDigits, hexColor]);
  
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : "#YYMMDD";

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col items-center gap-4">
            <Label htmlFor="color-picker" className="text-sm text-muted-foreground">Select a Color</Label>
            <Input 
                id="color-picker"
                type="color" 
                value={hexColor} 
                onChange={handleColorChange}
                className="w-24 h-24 p-1"
            />
        </div>

        <div className="text-center mt-6 min-h-[80px]">
          {hexColor ? (
            <div key={hexColor} className="animate-in fade-in-50 duration-500 flex flex-col justify-around items-center gap-4">
              <div className="flex items-center justify-center gap-0" >
                  <p className="text-lg text-white font-bold p-3" style={{ backgroundColor: hexColor }}>
                    {formattedDate}
                  </p>
                  <p className="text-lg text-white font-mono tracking-widest font-bold p-3" style={{ backgroundColor: hexColor }}>
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
              <p className="text-muted-foreground">Pick a color to generate a date.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
