'use server';
/**
 * @fileOverview Validates if a given date is in the past using GenAI.
 *
 * - validateDateWithGenAI - A function that validates if a date is in the past.
 * - ValidateDateWithGenAIInput - The input type for the validateDateWithGenAI function.
 * - ValidateDateWithGenAIOutput - The return type for the validateDateWithGenAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateDateWithGenAIInputSchema = z.object({date: z.string().describe('The date to validate in YYMMDD format.')});
export type ValidateDateWithGenAIInput = z.infer<typeof ValidateDateWithGenAIInputSchema>;

const ValidateDateWithGenAIOutputSchema = z.object({
isInPast: z.boolean().describe('Whether the date is in the past.'),
reason: z.string().optional().describe('The reason why the date is in the past, if applicable.'),
});
export type ValidateDateWithGenAIOutput = z.infer<typeof ValidateDateWithGenAIOutputSchema>;

export async function validateDateWithGenAI(input: ValidateDateWithGenAIInput): Promise<ValidateDateWithGenAIOutput> {
  return validateDateWithGenAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateDateWithGenAIPrompt',
  input: {schema: ValidateDateWithGenAIInputSchema},
  output: {schema: ValidateDateWithGenAIOutputSchema},
  prompt: `You are a date validation expert. Given the current date and a provided date, determine if the provided date is in the past. Current date: {{currentDate}}. Provided date: {{date}}.

  Return a JSON object indicating whether the provided date is in the past, and if so, provide a brief reason.
`,
});

const validateDateWithGenAIFlow = ai.defineFlow(
  {
    name: 'validateDateWithGenAIFlow',
    inputSchema: ValidateDateWithGenAIInputSchema,
    outputSchema: ValidateDateWithGenAIOutputSchema,
  },
  async input => {
    const currentDate = new Date().toLocaleDateString();
    const {output} = await prompt({...input, currentDate});
    return output!;
  }
);
