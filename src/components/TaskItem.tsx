import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Calendar as CalendarIcon, 
  Clock,
  GripVertical 
} from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "./TodoApp";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  isDragging: boolean;
}

export function TaskItem({ 
  task, 
  onToggle, 
  onUpdate, 
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editCategory, setEditCategory] = useState(task.category);
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(task.dueDate);

  const handleSaveEdit = () => {
    onUpdate(task.id, {
      text: editText.trim(),
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(task.text);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work": return "💼";
      case "study": return "📚";
      case "personal": return "🏠";
      default: return "📝";
    }
  };

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const isDueDateOverdue = task.dueDate && isPast(task.dueDate) && !task.completed;

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md animate-fade-in",
        task.completed && "opacity-60",
        isDragging && "opacity-50 rotate-2 scale-105 shadow-xl",
        task.priority === "high" && "border-l-4 border-l-red-500",
        task.priority === "medium" && "border-l-4 border-l-yellow-500",
        task.priority === "low" && "border-l-4 border-l-green-500"
      )}
      draggable={!isEditing}
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task.id)}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button className="mt-1 p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Checkbox */}
        <div className="mt-1">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="text-base"
                placeholder="Task description"
              />
              <div className="flex gap-2">
                <Select value={editPriority} onValueChange={(value: "high" | "medium" | "low") => setEditPriority(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={editCategory} onValueChange={(value: "work" | "study" | "personal") => setEditCategory(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">💼 Work</SelectItem>
                    <SelectItem value="study">📚 Study</SelectItem>
                    <SelectItem value="personal">🏠 Personal</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {editDueDate ? format(editDueDate, "MMM d") : "Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editDueDate}
                      onSelect={setEditDueDate}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={cn(
                "text-base leading-relaxed",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.text}
              </p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                
                <Badge variant="secondary">
                  {getCategoryIcon(task.category)} {task.category}
                </Badge>

                {task.dueDate && (
                  <Badge 
                    variant={isDueDateOverdue ? "destructive" : "outline"}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {formatDueDate(task.dueDate)}
                    {task.dueDate.getHours() !== 0 && (
                      <span className="ml-1">
                        {format(task.dueDate, "h:mm a")}
                      </span>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveEdit}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}