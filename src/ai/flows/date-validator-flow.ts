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
  prompt: `You are a helpful code assistant. Given a hex color, explain how it converts to the date '{{{date}}}' using the #YYMMDD format.

The hex color is {{{hexColor}}}.
- The first two characters ('{{hexColor.[1]}}{{hexColor.[2]}}') represent the year, converting to '{{year}}'.
- The middle two characters ('{{hexColor.[3]}}{{hexColor.[4]}}') represent the month, converting to '{{month}}'.
- The last two characters ('{{hexColor.[5]}}{{hexColor.[6]}}') represent the day, converting to '{{day}}'.

Provide a brief, one-sentence, creative explanation for why this is a valid date based on this #YYMMDD conversion. Confirm the date is valid.`,
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
