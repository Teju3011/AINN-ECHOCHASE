"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { SimulationGrid } from "@/components/simulation/simulation-grid";
import { ResultsPanel } from "@/components/simulation/results-panel";
import { createInitialGrid, findPathAStar, findPathBFS, getRandomMove } from "@/lib/simulation-logic";
import type { Position, SimulationConfig, SimulationLog, SimulationState } from "@/lib/types";
import { generateInitialConfiguration } from "@/ai/flows/generate-initial-configuration";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { Squirrel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function EcoChaseSimulation() {
  const { toast } = useToast();
  const [config, setConfig] = React.useState<SimulationConfig>({
    gridSize: 20,
    predatorAlgo: "A*",
    preyAlgo: "Random",
    obstacleDensity: 0.2,
    numPrey: 3,
  });
  const [simulationState, setSimulationState] = React.useState<SimulationState>("idle");
  const [step, setStep] = React.useState(0);
  const [rewards, setRewards] = React.useState(0);
  const [predatorPos, setPredatorPos] = React.useState<Position>({ x: 0, y: 0 });
  const [prey, setPrey] = React.useState<{ id: number; position: Position }[]>([]);
  const [obstacles, setObstacles] = React.useState<Position[]>([]);
  const [path, setPath] = React.useState<Position[]>([]);
  const [logs, setLogs] = React.useState<SimulationLog[]>([]);

  const simulationSpeed = 300; // ms per step

  const resetSimulation = React.useCallback((newConfig: SimulationConfig) => {
    const { gridSize, obstacleDensity, numPrey } = newConfig;
    const { predatorStart, preyStart, obstacles: newObstacles } = createInitialGrid(gridSize, obstacleDensity, numPrey);

    setPredatorPos(predatorStart);
    setPrey(preyStart.map((p, i) => ({ id: i, position: p })));
    setObstacles(newObstacles);
    setStep(0);
    setRewards(0);
    setPath([]);
    setLogs([{ step: 0, message: "Simulation initialized." }]);
    setSimulationState("idle");
    setConfig(newConfig);
  }, []);

  React.useEffect(() => {
    resetSimulation(config);
  }, [resetSimulation]);
  
  const handleAIGenerate = async (prompt: string) => {
    try {
      const result = await generateInitialConfiguration({ prompt });
      const newConfig = {
        gridSize: result.gridSize,
        predatorAlgo: config.predatorAlgo,
        preyAlgo: config.preyAlgo,
        obstacleDensity: result.obstacleDensity,
        numPrey: result.numPrey
      };
      
      const predatorStart = result.predatorInitialPosition;
      const preyStart = result.preyInitialPositions;
      const newObstacles = result.obstaclePositions;

      setPredatorPos(predatorStart);
      setPrey(preyStart.map((p, i) => ({ id: i, position: p })));
      setObstacles(newObstacles);
      setStep(0);
      setRewards(0);
      setPath([]);
      setLogs([{ step: 0, message: "AI generated configuration." }]);
      setSimulationState("idle");
      setConfig(newConfig);
      
      toast({
        title: "AI Configuration Generated",
        description: "The simulation has been updated with the new settings.",
      });

    } catch (error) {
      console.error("AI generation failed:", error);
      toast({
        variant: "destructive",
        title: "AI Generation Error",
        description: "Could not generate configuration. Please try again.",
      });
    }
  };

  const findClosestPrey = React.useCallback(() => {
    if (prey.length === 0) return null;

    let closestPrey = prey[0];
    let minDistance = Infinity;

    for (const p of prey) {
      const distance = Math.abs(p.position.x - predatorPos.x) + Math.abs(p.position.y - predatorPos.y);
      if (distance < minDistance) {
        minDistance = distance;
        closestPrey = p;
      }
    }
    return closestPrey;
  }, [prey, predatorPos]);


  const runSimulationStep = React.useCallback(() => {
    if (simulationState !== 'running' || prey.length === 0) {
      if (prey.length === 0 && simulationState === 'running') {
        setSimulationState('finished');
        setLogs(prev => [...prev, {step, message: "All prey captured! Simulation finished."}]);
      }
      return;
    }

    const currentStep = step + 1;
    let newRewards = rewards -1; // Time penalty
    let newLogs = [...logs];

    // 1. Move Prey
    const newPrey = prey.map(p => {
        const newPos = getRandomMove(p.position, config.gridSize, [predatorPos, ...obstacles]);
        return { ...p, position: newPos };
    });
    setPrey(newPrey);

    // 2. Move Predator
    const targetPrey = findClosestPrey();
    if (targetPrey) {
        let newPath: Position[];
        const pathfinder = config.predatorAlgo === "BFS" ? findPathBFS : findPathAStar;
        newPath = pathfinder(predatorPos, targetPrey.position, config.gridSize, obstacles);
        setPath(newPath);

        if (newPath && newPath.length > 0) {
            const newPredatorPos = newPath[0];
            const oldDist = Math.abs(targetPrey.position.x - predatorPos.x) + Math.abs(targetPrey.position.y - predatorPos.y);
            const newDist = Math.abs(targetPrey.position.x - newPredatorPos.x) + Math.abs(targetPrey.position.y - newPredatorPos.y);
            
            if (newDist < oldDist) {
              newRewards += 1; // Reward for getting closer
            }

            setPredatorPos(newPredatorPos);

            // 3. Check for capture
            const remainingPrey = newPrey.filter(p => {
                if (p.position.x === newPredatorPos.x && p.position.y === newPredatorPos.y) {
                    newRewards += 50; // Capture reward
                    newLogs.push({step: currentStep, message: `Predator captured prey at (${p.position.x}, ${p.position.y})!`});
                    return false;
                }
                return true;
            });
            setPrey(remainingPrey);

        } else {
           newLogs.push({step: currentStep, message: "Predator cannot find a path to the prey."});
        }
    }

    setStep(currentStep);
    setRewards(newRewards);
    setLogs(newLogs);

  }, [simulationState, step, rewards, predatorPos, prey, obstacles, config, logs, findClosestPrey]);

  React.useEffect(() => {
    if (simulationState === "running") {
      const timer = setTimeout(runSimulationStep, simulationSpeed);
      return () => clearTimeout(timer);
    }
  }, [simulationState, runSimulationStep]);


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" asChild>
              <a href="/" aria-label="Home"><Squirrel /></a>
            </Button>
            <h1 className="font-headline text-2xl font-semibold">EcoChase</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SimulationControls
            config={config}
            setConfig={setConfig}
            onReset={resetSimulation}
            onStart={() => {
              if (config.predatorAlgo.includes("PPO") || config.predatorAlgo.includes("SAC")) {
                toast({ variant: 'destructive', title: 'RL Not Implemented', description: 'Please select BFS or A* to run the simulation.' });
                return;
              }
              setSimulationState("running")
            }}
            onPause={() => setSimulationState("paused")}
            onGenerate={handleAIGenerate}
            simulationState={simulationState}
          />
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            <div className="lg:col-span-2 flex flex-col">
                 <SimulationGrid 
                    gridSize={config.gridSize}
                    predator={predatorPos}
                    prey={prey}
                    obstacles={obstacles}
                    path={path}
                  />
            </div>
            <div className="lg:col-span-1">
                 <ResultsPanel 
                    logs={logs} 
                    rewards={rewards} 
                    step={step} 
                    simulationState={simulationState}
                  />
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
