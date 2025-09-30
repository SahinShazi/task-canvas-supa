import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TaskInput } from "./TaskInput";
import { TaskItem } from "./TaskItem";
import { TaskFilters } from "./TaskFilters";
import { ProgressBar } from "./ProgressBar";
import { ThemeToggle } from "./ThemeToggle";
import { Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: "work" | "study" | "personal";
  dueDate?: Date;
  createdAt: Date;
}

export type FilterType = "all" | "completed" | "pending";
export type CategoryType = "all" | "work" | "study" | "personal";
export type PriorityFilter = "all" | "high" | "medium" | "low";

export function TodoApp() {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("todoTasks");
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));
      setTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const clearAllTasks = useCallback(() => {
    setTasks([]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed });
  }, [tasks, updateTask]);

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedTask(id);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTask || draggedTask === targetId) return;

    const draggedIndex = tasks.findIndex(t => t.id === draggedTask);
    const targetIndex = tasks.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [draggedItem] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedItem);

    setTasks(newTasks);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === "all" || 
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed);
    
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
    
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    const matchesSearch = searchQuery === "" || 
      task.text.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">My Tasks</h1>
            <p className="text-sm md:text-base text-muted-foreground truncate max-w-[280px] md:max-w-none">Welcome back, {user?.user_metadata?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} size="sm">
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={progress} totalTasks={totalTasks} completedTasks={completedTasks} />

        {/* Task Input */}
        <Card className="p-4 sm:p-6 mb-6 animate-fade-in">
          <TaskInput onAddTask={addTask} />
        </Card>

        {/* Filters */}
        <TaskFilters
          filter={filter}
          onFilterChange={setFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearAll={clearAllTasks}
          taskCount={tasks.length}
        />

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                {tasks.length === 0 
                  ? "No tasks yet. Add one above to get started!" 
                  : "No tasks match your current filters."}
              </p>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragging={draggedTask === task.id}
              />
            ))
          )}
        </div>

        {/* Clear All Button */}
        {tasks.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={clearAllTasks}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Tasks
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}