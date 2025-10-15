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
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 shadow-md border-primary/10 animate-fade-in">
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
            <Circle className="h-3 w-3 fill-priority-low text-priority-low" />
            Completed: {completedTasks}
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 fill-priority-medium text-priority-medium" />
            Remaining: {totalTasks - completedTasks}
          </div>
        </div>
      </div>

      {totalTasks > 0 && completedTasks === totalTasks && (
        <div className="mt-4 p-3 bg-priority-low-bg rounded-lg border border-priority-low/20">
          <div className="flex items-center gap-2 text-priority-low">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">All tasks completed! 🎉</span>
          </div>
        </div>
      )}
    </Card>
  );
}