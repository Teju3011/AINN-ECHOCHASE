export type Position = {
  x: number;
  y: number;
};

export type SimulationConfig = {
  gridSize: number;
  predatorAlgo: string;
  preyAlgo: string;
  obstacleDensity: number;
  numPrey: number;
};

export type SimulationState = "idle" | "running" | "paused" | "finished";

export type SimulationLog = {
    step: number;
    message: string;
}
