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

      <Card className="flex flex-col flex-1">
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
          <CardDescription>
            {simulationState === 'running' && 'Simulation in progress...'}
            {simulationState === 'paused' && 'Simulation paused.'}
            {simulationState === 'idle' && 'Simulation ready to start.'}
            {simulationState === 'finished' && 'Simulation finished.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-2 text-sm">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="font-mono text-muted-foreground w-8 text-right shrink-0">{log.step}</span>
                  <p className="flex-1">{log.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 size={20}/> AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button className="w-full" onClick={handleExplainPath} disabled={isExplaining || gridData.path.length === 0}>
              {isExplaining ? <Loader2 className="animate-spin"/> : <Sparkles size={16}/>} Explain Predator's Path
            </Button>
            {explanation && (
                <Alert>
                    <AlertTitle>Path Explanation</AlertTitle>
                    <AlertDescription>{explanation}</AlertDescription>
                </Alert>
            )}
          </div>
          <div className="space-y-2">
            <Button className="w-full" variant="secondary" onClick={handleSuggestImprovements} disabled={isSuggesting || step === 0}>
                {isSuggesting ? <Loader2 className="animate-spin"/> : <Sparkles size={16}/>} Suggest Improvements
            </Button>
            {suggestion && (
                <Alert>
                    <AlertTitle>Improvement Suggestion</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Grid Size:</strong> {suggestion.suggestedGridSize}</li>
                            <li><strong>Obstacles:</strong> {suggestion.suggestedObstacleDensity}</li>
                            <li><strong>Predator AI:</strong> {suggestion.suggestedPredatorAlgorithm}</li>
                            <li><strong>Prey AI:</strong> {suggestion.suggestedPreyAlgorithm}</li>
                        </ul>
                        <p className="mt-2 text-xs">{suggestion.suggestionRationale}</p>
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
