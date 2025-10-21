'use server';
/**
 * @fileOverview A date validation AI agent.
 *
 * - validateDate - A function that handles the date validation process.
 * - ValidateDateInput - The input type for the validateDate function.
 * - ValidateDateOutput - The return type for the validateDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateDateInputSchema = z.object({
  date: z.string().describe('The date to validate, in a readable format like "January 1, 2024".'),
  hexColor: z.string().describe('The hex color code that was selected.'),
  year: z.number().describe('The two-digit year component derived from the red channel.'),
  month: z.number().describe('The month component derived from the green channel.'),
  day: z.number().describe('The day component derived from the blue channel.'),
});
export type ValidateDateInput = z.infer<typeof ValidateDateInputSchema>;

const ValidateDateOutputSchema = z.object({
  reason: z.string().describe('A creative and brief explanation of why the provided date is conceptually valid based on its hex to number conversion.'),
});
export type ValidateDateOutput = z.infer<typeof ValidateDateOutputSchema>;

export async function validateDate(input: ValidateDateInput): Promise<ValidateDateOutput> {
  return dateValidatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dateValidatorPrompt',
  input: {schema: ValidateDateInputSchema},
  output: {schema: ValidateDateOutputSchema},
  prompt: `You are a helpful code assistant. Given a hex color, explain how it converts to the date '{{{date}}}'.

The hex color is {{{hexColor}}}.
- The red component converts to the year '{{year}}'.
- The green component converts to the month '{{month}}'.
- The blue component converts to the day '{{day}}'.

Provide a brief, one-sentence, creative explanation for why this is a valid date based on the conversion. Be creative and confirm the date is valid.`,
});

const dateValidatorFlow = ai.defineFlow(
  {
    name: 'dateValidatorFlow',
    inputSchema: ValidateDateInputSchema,
    outputSchema: ValidateDateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
