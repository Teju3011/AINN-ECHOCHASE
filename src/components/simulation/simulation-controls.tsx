"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BrainCircuit, Loader2, Pause, Play, RotateCw, Sparkles } from "lucide-react";
import type { SimulationConfig, SimulationState } from "@/lib/types";

const formSchema = z.object({
  gridSize: z.number().min(10).max(50),
  numPrey: z.number().min(1).max(10),
  obstacleDensity: z.number().min(0).max(1),
  predatorAlgo: z.string(),
  preyAlgo: z.string(),
  aiPrompt: z.string().optional(),
});

type SimulationControlsProps = {
  config: SimulationConfig;
  setConfig: (config: SimulationConfig) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: (config: SimulationConfig) => void;
  onGenerate: (prompt: string) => Promise<void>;
  simulationState: SimulationState;
};

export function SimulationControls({
  config,
  setConfig,
  onStart,
  onPause,
  onReset,
  onGenerate,
  simulationState,
}: SimulationControlsProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gridSize: config.gridSize,
      numPrey: config.numPrey,
      obstacleDensity: config.obstacleDensity,
      predatorAlgo: config.predatorAlgo,
      preyAlgo: config.preyAlgo,
      aiPrompt: "a 20x20 grid with 5 prey and medium obstacle density",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newConfig = {
      gridSize: values.gridSize,
      numPrey: values.numPrey,
      obstacleDensity: values.obstacleDensity,
      predatorAlgo: values.predatorAlgo,
      preyAlgo: values.preyAlgo,
    };
    setConfig(newConfig);
    onReset(newConfig);
  };
  
  const handleGenerate = async () => {
    const prompt = form.getValues("aiPrompt");
    if (!prompt) return;
    setIsGenerating(true);
    await onGenerate(prompt);
    setIsGenerating(false);
  }

  const isRunning = simulationState === 'running';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
        <div className="space-y-4">
            <CardTitle className="text-lg font-semibold">Controls</CardTitle>
            <div className="grid grid-cols-2 gap-2">
                {isRunning ? (
                    <Button type="button" onClick={onPause}><Pause/>Pause</Button>
                ) : (
                    <Button type="button" onClick={onStart} disabled={simulationState === 'finished'} className="bg-green-600 hover:bg-green-700 text-white"><Play/>Start</Button>
                )}
                <Button type="submit" variant="outline"><RotateCw/>Apply & Reset</Button>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="gridSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grid Size: {field.value}x{field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={10}
                      max={50}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                      value={[field.value]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numPrey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Prey: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                      value={[field.value]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="obstacleDensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obstacle Density: {(field.value * 100).toFixed(0)}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={(value) => field.onChange(value[0])}
                      value={[field.value]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Agents AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                control={form.control}
                name="predatorAlgo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Predator Algorithm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an algorithm" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="A*">A* Search</SelectItem>
                            <SelectItem value="BFS">BFS</SelectItem>
                            <SelectItem value="PPO" disabled>PPO (RL)</SelectItem>
                            <SelectItem value="SAC" disabled>SAC (RL)</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="preyAlgo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prey Algorithm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an algorithm" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Random">Random Movement</SelectItem>
                            <SelectItem value="PPO" disabled>PPO (RL)</SelectItem>
                            <SelectItem value="SAC" disabled>SAC (RL)</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit size={20}/> Generate with AI</CardTitle>
                <CardDescription>Describe the simulation you want to create.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                control={form.control}
                name="aiPrompt"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Textarea placeholder="e.g., a large grid with many obstacles and a few prey" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="button" onClick={handleGenerate} disabled={isGenerating} className="w-full">
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Generate
                </Button>
            </CardContent>
        </Card>
      </form>
    </Form>
  );
}
