import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Trash2 } from "lucide-react";
import { FilterType, CategoryType, PriorityFilter } from "./TodoApp";

interface TaskFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  categoryFilter: CategoryType;
  onCategoryFilterChange: (category: CategoryType) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilterChange: (priority: PriorityFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearAll: () => void;
  taskCount: number;
}

export function TaskFilters({
  filter,
  onFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  searchQuery,
  onSearchChange,
  onClearAll,
  taskCount
}: TaskFiltersProps) {
  return (
    <Card className="p-4 mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryFilterChange("all")}
          >
            All Categories
          </Button>
          <Button
            variant={categoryFilter === "work" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryFilterChange("work")}
          >
            💼 Work
          </Button>
          <Button
            variant={categoryFilter === "study" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryFilterChange("study")}
          >
            📚 Study
          </Button>
          <Button
            variant={categoryFilter === "personal" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryFilterChange("personal")}
          >
            🏠 Personal
          </Button>
        </div>
      </div>

      {/* Priority Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={priorityFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onPriorityFilterChange("all")}
          >
            All Priorities
          </Button>
          <Button
            variant={priorityFilter === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => onPriorityFilterChange("high")}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full bg-red-500" />
            High
          </Button>
          <Button
            variant={priorityFilter === "medium" ? "default" : "outline"}
            size="sm"
            onClick={() => onPriorityFilterChange("medium")}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            Medium
          </Button>
          <Button
            variant={priorityFilter === "low" ? "default" : "outline"}
            size="sm"
            onClick={() => onPriorityFilterChange("low")}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full bg-green-500" />
            Low
          </Button>
        </div>
      </div>

      {/* Clear All Button */}
      {taskCount > 0 && (
        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Tasks ({taskCount})
          </Button>
        </div>
      )}
    </Card>
  );
}