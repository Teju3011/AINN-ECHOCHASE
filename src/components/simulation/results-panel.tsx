"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimulationLog, SimulationState } from "@/lib/types";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { explainAISearchPath } from "@/ai/flows/explain-ai-search-path";
import { suggestSimulationImprovements } from "@/ai/flows/suggest-simulation-improvements";

type ResultsPanelProps = {
  logs: SimulationLog[];
  rewards: number;
  step: number;
  simulationState: SimulationState;
  gridData: {
    gridSize: number;
    predatorPosition: { x: number, y: number };
    preyPositions: { x: number, y: number }[];
    obstaclePositions: { x: number, y: number }[];
    path: { x: number, y: number }[];
    searchAlgorithm: string;
  },
  simulationConfig: {
    gridSize: string;
    obstacleDensity: string;
    predatorAlgorithm: string;
    preyAlgorithm: string;
  }
};

export function ResultsPanel({ logs, rewards, step, simulationState, gridData, simulationConfig }: ResultsPanelProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [isExplaining, setIsExplaining] = React.useState(false);
  const [explanation, setExplanation] = React.useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<any | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  const handleExplainPath = async () => {
    setIsExplaining(true);
    setExplanation(null);
    try {
        const { path, predatorPosition, obstaclePositions, gridSize, searchAlgorithm } = gridData;
        const targetPrey = path.length > 0 ? path[path.length -1] : gridData.preyPositions[0];
        
        if (!targetPrey) {
             toast({ variant: "destructive", title: "Cannot Explain Path", description: "No prey found to target." });
             setIsExplaining(false);
             return;
        }

        const res = await explainAISearchPath({
            path: path,
            predatorPosition: predatorPosition,
            preyPosition: targetPrey,
            obstaclePositions: obstaclePositions,
            gridSize: gridSize,
            searchAlgorithm: searchAlgorithm,
        });
        setExplanation(res.explanation);
    } catch (e) {
        toast({ variant: "destructive", title: "AI Explanation Failed", description: "Could not generate an explanation." });
        console.error(e);
    } finally {
        setIsExplaining(false);
    }
  }

  const handleSuggestImprovements = async () => {
    setIsSuggesting(true);
    setSuggestion(null);
    try {
        const res = await suggestSimulationImprovements({
            ...simulationConfig,
            simulationResults: logs.slice(-5).map(l => l.message).join('\n')
        });
        setSuggestion(res);
    } catch (e) {
        toast({ variant: "destructive", title: "AI Suggestion Failed", description: "Could not generate a suggestion." });
        console.error(e);
    } finally {
        setIsSuggesting(false);
    }
  }


  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Simulation Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Step</p>
            <p className="text-3xl font-bold font-headline">{step}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reward</p>
            <p className="text-3xl font-bold font-code text-primary">{rewards}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
