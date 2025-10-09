"use client";
import { cn } from "@/lib/utils";
import * as React from 'react';

export const PredatorIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("w-6 h-6", className)}
        {...props}
      >
        <path d="M12 2L2 22h20L12 2z" />
      </svg>
    )
  );
PredatorIcon.displayName = "PredatorIcon";

export const PreyIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("w-6 h-6", className)}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    )
  );
PreyIcon.displayName = "PreyIcon";

export const ObstacleIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("w-6 h-6", className)}
        {...props}
      >
        <rect width="20" height="20" x="2" y="2" rx="2" />
      </svg>
    )
  );
ObstacleIcon.displayName = "ObstacleIcon";
