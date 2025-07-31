'use server';

/**
 * @fileOverview An AI agent that suggests service item descriptions based on a short input.
 *
 * - suggestServiceItemDescriptions - A function that handles the service item description suggestion process.
 * - SuggestServiceItemDescriptionsInput - The input type for the suggestServiceItemDescriptions function.
 * - SuggestServiceItemDescriptionsOutput - The return type for the suggestServiceItemDescriptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestServiceItemDescriptionsInputSchema = z.object({
  shortInput: z
    .string()
    .describe('A short input describing the service item.'),
});
export type SuggestServiceItemDescriptionsInput = z.infer<
  typeof SuggestServiceItemDescriptionsInputSchema
>;

const SuggestServiceItemDescriptionsOutputSchema = z.object({
  suggestedDescription: z
    .string()
    .describe('The AI-generated suggested description for the service item.'),
});
export type SuggestServiceItemDescriptionsOutput = z.infer<
  typeof SuggestServiceItemDescriptionsOutputSchema
>;

export async function suggestServiceItemDescriptions(
  input: SuggestServiceItemDescriptionsInput
): Promise<SuggestServiceItemDescriptionsOutput> {
  return suggestServiceItemDescriptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestServiceItemDescriptionsPrompt',
  input: {schema: SuggestServiceItemDescriptionsInputSchema},
  output: {schema: SuggestServiceItemDescriptionsOutputSchema},
  prompt: `You are a helpful mechanic assistant. Based on the short input provided, suggest a detailed description for the service item.

Short Input: {{{shortInput}}}

Suggested Description:`, // The output schema description is automatically added to the prompt for formatting.
});

const suggestServiceItemDescriptionsFlow = ai.defineFlow(
  {
    name: 'suggestServiceItemDescriptionsFlow',
    inputSchema: SuggestServiceItemDescriptionsInputSchema,
    outputSchema: SuggestServiceItemDescriptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
