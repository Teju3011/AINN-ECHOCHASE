'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating initial configurations for a predator-prey simulation.
 *
 * It includes:
 * - `generateInitialConfiguration`: A function that takes a text prompt and returns a JSON configuration for the simulation.
 * - `InitialConfigurationInput`: The input type for the `generateInitialConfiguration` function.
 * - `InitialConfigurationOutput`: The output type for the `generateInitialConfiguration` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialConfigurationInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A text prompt describing the desired initial configuration of the predator-prey simulation, including grid size, number of prey, and obstacle density.'
    ),
});
export type InitialConfigurationInput = z.infer<typeof InitialConfigurationInputSchema>;

const InitialConfigurationOutputSchema = z.object({
  gridSize: z.number().describe('The size of the grid (e.g., 10 for a 10x10 grid).'),
  numPrey: z.number().describe('The number of prey in the simulation.'),
  obstacleDensity: z
    .number()
    .describe('The density of obstacles in the grid (a value between 0 and 1).'),
  predatorInitialPosition: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .describe('The initial position of the predator'),
  preyInitialPositions: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
      })
    )
    .describe('The initial positions of the prey'),
  obstaclePositions: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
      })
    )
    .describe('The positions of the obstacles'),
});
export type InitialConfigurationOutput = z.infer<typeof InitialConfigurationOutputSchema>;

export async function generateInitialConfiguration(
  input: InitialConfigurationInput
): Promise<InitialConfigurationOutput> {
  return generateInitialConfigurationFlow(input);
}

const generateInitialConfigurationPrompt = ai.definePrompt({
  name: 'generateInitialConfigurationPrompt',
  input: {schema: InitialConfigurationInputSchema},
  output: {schema: InitialConfigurationOutputSchema},
  prompt: `You are a configuration generator for a predator-prey simulation.

  Based on the user's prompt, create a JSON configuration that specifies the initial state of the simulation.
  Ensure that the configuration is valid and includes reasonable values for grid size, number of prey, and obstacle density.

  User Prompt: {{{prompt}}}

  Output:
  `,
});

const generateInitialConfigurationFlow = ai.defineFlow(
  {
    name: 'generateInitialConfigurationFlow',
    inputSchema: InitialConfigurationInputSchema,
    outputSchema: InitialConfigurationOutputSchema,
  },
  async input => {
    const {output} = await generateInitialConfigurationPrompt(input);
    return output!;
  }
);
