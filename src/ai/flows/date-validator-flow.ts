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
  year: z.number().describe('The two-digit year component derived from the first two hex characters.'),
  month: z.number().describe('The month component derived from the middle two hex characters.'),
  day: z.number().describe('The day component derived from the last two hex characters.'),
});
export type ValidateDateInput = z.infer<typeof ValidateDateInputSchema>;

const ValidateDateOutputSchema = z.object({
  haiku: z.string().describe('A haiku about the color and time of year.'),
});
export type ValidateDateOutput = z.infer<typeof ValidateDateOutputSchema>;

export async function validateDate(input: ValidateDateInput): Promise<ValidateDateOutput> {
  return dateValidatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dateValidatorPrompt',
  input: {schema: ValidateDateInputSchema},
  output: {schema: ValidateDateOutputSchema},
  prompt: `You are a helpful AI assistant who is an expert in writing haikus.

The user has provided a date: {{{date}}}.
The user has also provided a hex color: {{{hexColor}}}.

Write a haiku (5-7-5 syllables) that describes the color and references the time of year for the given date.`,
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
