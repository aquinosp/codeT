'use server';

import { suggestServiceItemDescriptions } from '@/ai/flows/suggest-service-item-descriptions';
import { z } from 'zod';

const inputSchema = z.object({
  shortInput: z.string(),
});

export async function suggestDescriptionAction(input: { shortInput: string }) {
  const validatedInput = inputSchema.parse(input);
  try {
    const result = await suggestServiceItemDescriptions(validatedInput);
    return result;
  } catch (error) {
    console.error("Error in suggestDescriptionAction:", error);
    throw new Error("Failed to suggest description.");
  }
}
