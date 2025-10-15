import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Load tasks from database on component mount
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const parsedTasks = (data || []).map((task: any) => ({
          id: task.id,
          text: task.text,
          completed: task.completed,
          priority: task.priority as "high" | "medium" | "low",
          category: task.category as "work" | "study" | "personal",
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          createdAt: new Date(task.created_at),
        }));
        
        setTasks(parsedTasks);
      } catch (error: any) {
        toast({
          title: "Error loading tasks",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, toast]);

  const addTask = useCallback(async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          text: taskData.text,
          completed: taskData.completed,
          priority: taskData.priority,
          category: taskData.category,
          due_date: taskData.dueDate?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        text: data.text,
        completed: data.completed,
        priority: data.priority as "high" | "medium" | "low",
        category: data.category as "work" | "study" | "personal",
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        createdAt: new Date(data.created_at),
      };
      
      setTasks(prev => [newTask, ...prev]);
      
      toast({
        title: "Task added",
        description: "Your task has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding task",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (updates.text !== undefined) updateData.text = updates.text;
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      
      toast({
        title: "Task deleted",
        description: "Your task has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const clearAllTasks = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks([]);
      
      toast({
        title: "All tasks cleared",
        description: "All your tasks have been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error clearing tasks",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              My Tasks
            </h1>
            <p className="text-sm md:text-base text-muted-foreground truncate max-w-[280px] md:max-w-none">
              Welcome back, <span className="font-medium text-foreground">{user?.user_metadata?.name || user?.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} size="sm" className="hover:shadow-md transition-shadow">
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={progress} totalTasks={totalTasks} completedTasks={completedTasks} />

        {/* Task Input */}
        <Card className="p-4 sm:p-6 mb-6 animate-fade-in shadow-md hover:shadow-lg transition-all border-primary/10">
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
            <Card className="p-8 text-center shadow-md border-primary/10">
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
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive hover:shadow-md transition-all"
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