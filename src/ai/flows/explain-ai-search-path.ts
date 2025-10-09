'use server';

/**
 * @fileOverview Explains the path determined by the AI search algorithm (BFS or A*) for the predator.
 *
 * - explainAISearchPath - A function that explains the AI search path.
 * - ExplainAISearchPathInput - The input type for the explainAISearchPath function.
 * - ExplainAISearchPathOutput - The return type for the explainAISearchPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainAISearchPathInputSchema = z.object({
  gridSize: z.number().describe('The size of the grid (e.g., 10 for a 10x10 grid).'),
  predatorPosition: z.object({
    x: z.number().describe('The x-coordinate of the predator.'),
    y: z.number().describe('The y-coordinate of the predator.'),
  }).describe('The starting position of the predator.'),
  preyPosition: z.object({
    x: z.number().describe('The x-coordinate of the prey.'),
    y: z.number().describe('The y-coordinate of the prey.'),
  }).describe('The position of the prey.'),
  obstaclePositions: z.array(
    z.object({
      x: z.number().describe('The x-coordinate of the obstacle.'),
      y: z.number().describe('The y-coordinate of the obstacle.'),
    })
  ).describe('The positions of the obstacles.'),
  searchAlgorithm: z.enum(['BFS', 'A*']).describe('The search algorithm used (BFS or A*).'),
  path: z.array(
    z.object({
      x: z.number().describe('The x-coordinate of the path step.'),
      y: z.number().describe('The y-coordinate of the path step.'),
    })
  ).describe('The path taken by the predator.'),
});

export type ExplainAISearchPathInput = z.infer<typeof ExplainAISearchPathInputSchema>;

const ExplainAISearchPathOutputSchema = z.object({
  explanation: z.string().describe('The explanation of why the AI search algorithm chose the path.'),
});

export type ExplainAISearchPathOutput = z.infer<typeof ExplainAISearchPathOutputSchema>;

export async function explainAISearchPath(input: ExplainAISearchPathInput): Promise<ExplainAISearchPathOutput> {
  return explainAISearchPathFlow(input);
}

const explainAISearchPathPrompt = ai.definePrompt({
  name: 'explainAISearchPathPrompt',
  input: {schema: ExplainAISearchPathInputSchema},
  output: {schema: ExplainAISearchPathOutputSchema},
  prompt: `You are an AI expert explaining the path chosen by a search algorithm in a predator-prey simulation.

Given the following scenario, explain why the {{searchAlgorithm}} algorithm chose the given path for the predator to catch the prey.

Grid Size: {{gridSize}}x{{gridSize}}
Predator Starting Position: ({{predatorPosition.x}}, {{predatorPosition.y}})
Prey Position: ({{preyPosition.x}}, {{preyPosition.y}})
Obstacle Positions: {{#each obstaclePositions}} ({{x}}, {{y}}){{#unless @last}},{{/unless}}{{/each}}
Search Algorithm: {{searchAlgorithm}}
Path: {{#each path}} ({{x}}, {{y}}){{#unless @last}},{{/unless}}{{/each}}

Explain the reasoning behind this path, considering the algorithm's goals (catching the prey), constraints (obstacles), and search strategy.
`,
});

const explainAISearchPathFlow = ai.defineFlow(
  {
    name: 'explainAISearchPathFlow',
    inputSchema: ExplainAISearchPathInputSchema,
    outputSchema: ExplainAISearchPathOutputSchema,
  },
  async input => {
    const {output} = await explainAISearchPathPrompt(input);
    return output!;
  }
);
