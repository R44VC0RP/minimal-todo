
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Calendar } from 'lucide-react';
import type { Task, TaskStatus } from '../../../server/src/schema';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  isLoading?: boolean;
}

export function TaskItem({ task, onEdit, onDelete, onStatusChange, isLoading = false }: TaskItemProps) {
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Backlog':
        return <Badge variant="secondary" className="bg-gray-700 text-gray-300">📋 Backlog</Badge>;
      case 'In Progress':
        return <Badge variant="secondary" className="bg-blue-900 text-blue-200">🚀 In Progress</Badge>;
      case 'Done':
        return <Badge variant="secondary" className="bg-green-900 text-green-200">✅ Done</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return dueDate < today && task.status !== 'Done';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`bg-gray-900 border-gray-800 transition-all hover:border-gray-700 ${
      task.status === 'Done' ? 'opacity-75' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(task.status)}
              {isOverdue() && (
                <Badge variant="destructive" className="bg-red-900 text-red-200">
                  Overdue
                </Badge>
              )}
            </div>
            
            <p className={`text-gray-100 leading-relaxed ${
              task.status === 'Done' ? 'line-through text-gray-400' : ''
            }`}>
              {task.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className={isOverdue() ? 'text-red-400' : ''}>
                  Due: {formatDate(task.due_date)}
                </span>
              </div>
              <span>Created: {formatDate(task.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={task.status}
              onValueChange={(value: TaskStatus) => onStatusChange(value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-100 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="Backlog" className="text-gray-100 focus:bg-gray-700">
                  📋 Backlog
                </SelectItem>
                <SelectItem value="In Progress" className="text-gray-100 focus:bg-gray-700">
                  🚀 In Progress
                </SelectItem>
                <SelectItem value="Done" className="text-gray-100 focus:bg-gray-700">
                  ✅ Done
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isLoading}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
