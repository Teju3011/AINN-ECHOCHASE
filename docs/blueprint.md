# **App Name**: EcoChase

## Core Features:

- Configurable Grid Environment: Set up the 2D grid size and populate it with a predator, prey, and optional obstacles.
- Classical Search Algorithms: Implement Breadth-First Search (BFS) and A* search for the predator to find an efficient path to the prey, avoiding obstacles.
- Random Prey Movement: Enable prey to move randomly, adding unpredictability to the simulation and the predator's task.
- Reinforcement Learning Agents: Incorporate Proximal Policy Optimization (PPO) or Soft Actor-Critic (SAC) for the predator to learn optimal hunting strategies.
- Adaptive Prey AI (Optional): Optionally, allow prey to be controlled by a reinforcement learning agent that learns to evade predators.
- Reward System: Establish a reward structure where the predator gains points for catching prey and incurs penalties for each move, promoting efficiency.
- Visual Simulation and Tracking: Display the simulation in a user-friendly format, updating positions and tracking cumulative rewards for RL agents. The format must incorporate predator, prey, obstacles, movements and reward.

## Style Guidelines:

- Primary color: Earthy Green (#849324) to evoke a natural environment.
- Background color: Desaturated Light Green (#E4E8D6), complementing the primary color without overwhelming the simulation.
- Accent color: Burnt Sienna (#BA6236) to highlight interactive elements and predator/prey, standing out from the analogous palette.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines, 'Inter' (sans-serif) for body text.
- Code font: 'Source Code Pro' for displaying the rewards in an easy to read way.
- Simple, geometric icons for predator, prey, and obstacles.
- Subtle animations for movement of entities.