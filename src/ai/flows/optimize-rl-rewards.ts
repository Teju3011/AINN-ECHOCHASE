'use server';

/**
 * @fileOverview A flow to optimize the reward system for reinforcement learning agents in a predator-prey simulation.
 *
 * - optimizeRLRewards - A function that suggests improvements to the reward system.
 * - OptimizeRLRewardsInput - The input type for the optimizeRLRewards function.
 * - OptimizeRLRewardsOutput - The return type for the optimizeRLRewards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeRLRewardsInputSchema = z.object({
  environmentDescription: z
    .string()
    .describe('Description of the 2D grid environment, including size and any obstacles.'),
  predatorDescription: z
    .string()
    .describe('Description of the predator agent, including its goals and capabilities.'),
  preyDescription: z
    .string()
    .describe('Description of the prey agent, including its goals and capabilities.'),
  existingRewards: z
    .string()
    .describe('The current reward system, including positive and negative rewards for different actions.'),
  desiredBehavior: z
    .string()
    .describe('The desired behavior of the predator and prey agents in the simulation.'),
});
export type OptimizeRLRewardsInput = z.infer<typeof OptimizeRLRewardsInputSchema>;

const OptimizeRLRewardsOutputSchema = z.object({
  suggestedRewards: z
    .string()
    .describe('A revised reward system designed to encourage the desired behavior, with explanations.'),
});
export type OptimizeRLRewardsOutput = z.infer<typeof OptimizeRLRewardsOutputSchema>;

export async function optimizeRLRewards(input: OptimizeRLRewardsInput): Promise<OptimizeRLRewardsOutput> {
  return optimizeRLRewardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeRLRewardsPrompt',
  input: {schema: OptimizeRLRewardsInputSchema},
  output: {schema: OptimizeRLRewardsOutputSchema},
  prompt: `You are an expert in designing reward systems for reinforcement learning agents.

You are designing a reward system for a predator-prey simulation. The goal is to create a reward system that encourages the predator and prey to exhibit the desired behavior.

Here is a description of the environment:
{{environmentDescription}}

Here is a description of the predator:
{{predatorDescription}}

Here is a description of the prey:
{{preyDescription}}

Here is the current reward system:
{{existingRewards}}

Here is the desired behavior:
{{desiredBehavior}}

Based on this information, suggest an improved reward system. Explain why you are suggesting each change.

Your response should be formatted as a single string describing the reward system, including positive and negative rewards for different actions, and a brief explanation of why each reward is suggested.
`,
});

const optimizeRLRewardsFlow = ai.defineFlow(
  {
    name: 'optimizeRLRewardsFlow',
    inputSchema: OptimizeRLRewardsInputSchema,
    outputSchema: OptimizeRLRewardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
