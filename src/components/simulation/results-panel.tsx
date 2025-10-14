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


type ResultsPanelProps = {
  logs: SimulationLog[];
  rewards: number;
  step: number;
  simulationState: SimulationState;
};

export function ResultsPanel({ logs, rewards, step, simulationState }: ResultsPanelProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-4 h-full">
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

      <Card className="flex-1 flex flex-col">
        <CardHeader>
            <CardTitle>Game Console</CardTitle>
            <CardDescription>Events and logs from the simulation.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
            <ScrollArea className="flex-1 h-48" ref={scrollAreaRef}>
                <div className="space-y-2 text-sm font-mono">
                    {logs.map((log) => (
                        <div key={log.step}>
                           <span className="text-muted-foreground mr-2">[{log.step}]</span>
                           {log.message}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
