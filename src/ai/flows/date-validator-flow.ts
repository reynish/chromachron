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
});
export type ValidateDateInput = z.infer<typeof ValidateDateInputSchema>;

const ValidateDateOutputSchema = z.object({
  reason: z.string().describe('A creative and brief explanation of why the provided date is historically or conceptually significant or valid.'),
});
export type ValidateDateOutput = z.infer<typeof ValidateDateOutputSchema>;

export async function validateDate(input: ValidateDateInput): Promise<ValidateDateOutput> {
  return dateValidatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dateValidatorPrompt',
  input: {schema: ValidateDateInputSchema},
  output: {schema: ValidateDateOutputSchema},
  prompt: `You are a creative historian. Given the date {{{date}}}, provide a brief, one-sentence, creative explanation for why this is a valid or interesting date. It can be a historical fact, an astrological curiosity, or just a quirky observation. Be creative.`,
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
