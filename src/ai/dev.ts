import { config } from 'dotenv';
config();

import '@/ai/flows/explain-ai-search-path.ts';
import '@/ai/flows/generate-initial-configuration.ts';
import '@/ai/flows/suggest-simulation-improvements.ts';
import '@/ai/flows/optimize-rl-rewards.ts';