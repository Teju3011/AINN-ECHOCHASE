"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PredatorIcon, PreyIcon, ObstacleIcon } from "./icons";
import type { Position } from "@/lib/types";
import { Card, CardContent } from "../ui/card";

type SimulationGridProps = {
  gridSize: number;
  predator: Position;
  prey: { id: number; position: Position }[];
  obstacles: Position[];
  path: Position[];
};

export function SimulationGrid({
  gridSize,
  predator,
  prey,
  obstacles,
  path,
}: SimulationGridProps) {
  const cellSize = Math.max(1, 40 - gridSize); // Dynamic cell size

  const gridStyle = {
    gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
    width: `${gridSize * cellSize}px`,
    height: `${gridSize * cellSize}px`,
  };

  const entityStyle = (pos: Position) => ({
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    transform: `translate(${pos.x * cellSize}px, ${pos.y * cellSize}px)`,
    transition: 'transform 300ms ease-in-out',
  });

  return (
    <Card className="flex-1 flex flex-col">
        <CardContent className="p-4 flex-1 flex items-center justify-center">
            <div
                className="relative bg-background rounded-md shadow-inner"
                style={{
                    width: `${gridSize * cellSize}px`,
                    height: `${gridSize * cellSize}px`,
                }}
            >
                <div className="absolute inset-0 grid" style={gridStyle}>
                    {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                    const x = i % gridSize;
                    const y = Math.floor(i / gridSize);
                    const isPath = path.some(p => p.x === x && p.y === y);
                    return (
                        <div
                        key={i}
                        className={cn(
                            "border border-border/20",
                            isPath && "bg-primary/20"
                        )}
                        />
                    );
                    })}
                </div>

                {obstacles.map((obs, i) => (
                    <div key={`obs-${i}`} className="absolute top-0 left-0" style={entityStyle(obs)}>
                        <ObstacleIcon className="w-full h-full text-muted-foreground/50" />
                    </div>
                ))}
                
                {prey.map((p) => (
                    <div key={`prey-${p.id}`} className="absolute top-0 left-0" style={entityStyle(p.position)}>
                        <PreyIcon className="w-full h-full text-accent" />
                    </div>
                ))}

                <div className="absolute top-0 left-0" style={entityStyle(predator)}>
                    <PredatorIcon className="w-full h-full text-primary" />
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
