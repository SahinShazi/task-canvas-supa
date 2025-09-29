import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

interface ProgressBarProps {
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export function ProgressBar({ progress, totalTasks, completedTasks }: ProgressBarProps) {
  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Progress</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {Math.round(progress)}%
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Tasks</div>
          <div className="font-semibold">
            {completedTasks} of {totalTasks}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Progress 
          value={progress} 
          className="h-3 bg-progress-bg" 
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
            Completed: {completedTasks}
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            Remaining: {totalTasks - completedTasks}
          </div>
        </div>
      </div>

      {totalTasks > 0 && completedTasks === totalTasks && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">All tasks completed! 🎉</span>
          </div>
        </div>
      )}
    </Card>
  );
}