'use server';

/**
 * @fileOverview A simulation improvements suggestion AI agent.
 *
 * - suggestSimulationImprovements - A function that suggests improvements for the simulation setup.
 * - SuggestSimulationImprovementsInput - The input type for the suggestSimulationImprovements function.
 * - SuggestSimulationImprovementsOutput - The return type for the suggestSimulationImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimulationImprovementsInputSchema = z.object({
  gridSize: z.string().describe('The size of the grid (e.g., 10x10).'),
  obstacleDensity: z
    .string()
    .describe('The density of obstacles in the grid (e.g., low, medium, high).'),
  predatorAlgorithm: z
    .string()
    .describe('The algorithm used by the predator (e.g., BFS, A*, PPO, SAC).'),
  preyAlgorithm: z
    .string()
    .describe('The algorithm used by the prey (e.g., random, PPO, SAC).'),
  simulationResults: z
    .string()
    .describe('A description of the simulation results, including predator/prey movements and rewards.'),
});
export type SuggestSimulationImprovementsInput = z.infer<
  typeof SuggestSimulationImprovementsInputSchema
>;

const SuggestSimulationImprovementsOutputSchema = z.object({
  suggestedGridSize: z
    .string()
    .describe('A suggested grid size to explore (e.g., 20x20).'),
  suggestedObstacleDensity: z
    .string()
    .describe('A suggested obstacle density to explore (e.g., none, low, high).'),
  suggestedPredatorAlgorithm: z
    .string()
    .describe(
      'A suggested predator algorithm to explore (e.g., BFS, A*, PPO, SAC).
      If the current algorithm is a classical search algorithm, suggest a reinforcement learning algorithm, or vice versa.'
    ),
  suggestedPreyAlgorithm: z
    .string()
    .describe(
      'A suggested prey algorithm to explore (e.g., random, PPO, SAC).
      If the current algorithm is random, suggest a reinforcement learning algorithm, or vice versa.'
    ),
  suggestionRationale: z
    .string()
    .describe(
      'A brief explanation of why the suggested improvements might lead to interesting behaviors.'
    ),
});
export type SuggestSimulationImprovementsOutput = z.infer<
  typeof SuggestSimulationImprovementsOutputSchema
>;

export async function suggestSimulationImprovements(
  input: SuggestSimulationImprovementsInput
): Promise<SuggestSimulationImprovementsOutput> {
  return suggestSimulationImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimulationImprovementsPrompt',
  input: {schema: SuggestSimulationImprovementsInputSchema},
  output: {schema: SuggestSimulationImprovementsOutputSchema},
  prompt: `You are an AI simulation expert, specializing in suggesting improvements to simulation setups to explore different scenarios and find interesting behaviors.

  Based on the current simulation setup and results, suggest one or more improvements to the simulation setup, including grid size, obstacle density, predator algorithm, and prey algorithm.

  Explain why the suggested improvements might lead to interesting behaviors.

  Current Simulation Setup:
  - Grid Size: {{{gridSize}}}
  - Obstacle Density: {{{obstacleDensity}}}
  - Predator Algorithm: {{{predatorAlgorithm}}}
  - Prey Algorithm: {{{preyAlgorithm}}}

  Simulation Results:
  {{{simulationResults}}}

  Output your suggestion in JSON format adhering to the following schema. The Zod descriptions give more detail about the function of each field:
  \{
    suggestedGridSize: string // A suggested grid size to explore (e.g., 20x20).},
    suggestedObstacleDensity: string, // A suggested obstacle density to explore (e.g., none, low, high).},
    suggestedPredatorAlgorithm: string, // A suggested predator algorithm to explore (e.g., BFS, A*, PPO, SAC). If the current algorithm is a classical search algorithm, suggest a reinforcement learning algorithm, or vice versa.},
    suggestedPreyAlgorithm: string, // A suggested prey algorithm to explore (e.g., random, PPO, SAC). If the current algorithm is random, suggest a reinforcement learning algorithm, or vice versa.},
    suggestionRationale: string // A brief explanation of why the suggested improvements might lead to interesting behaviors.
  \}
  `,
});

const suggestSimulationImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestSimulationImprovementsFlow',
    inputSchema: SuggestSimulationImprovementsInputSchema,
    outputSchema: SuggestSimulationImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
