
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CreateTaskInput, Task, TaskStatus } from '../../../server/src/schema';

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Task;
  isEditing?: boolean;
}

export function TaskForm({ onSubmit, onCancel, isLoading = false, initialData, isEditing = false }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    description: initialData?.description || '',
    due_date: initialData ? new Date(initialData.due_date) : new Date(),
    status: (initialData?.status as TaskStatus) || 'Backlog'
  });

  // Separate state for the date input string
  const [dateString, setDateString] = useState(() => {
    if (initialData) {
      return new Date(initialData.due_date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateString = e.target.value;
    setDateString(newDateString);
    setFormData((prev: CreateTaskInput) => ({ 
      ...prev, 
      due_date: new Date(newDateString) 
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-200">
          Description *
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateTaskInput) => ({ ...prev, description: e.target.value }))
          }
          placeholder="What needs to be done?"
          className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500"
          required
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date" className="text-gray-200">
          Due Date *
        </Label>
        <Input
          id="due_date"
          type="date"
          value={dateString}
          onChange={handleDateChange}
          className="bg-gray-800 border-gray-700 text-gray-100 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-gray-200">
          Status
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value: TaskStatus) =>
            setFormData((prev: CreateTaskInput) => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100 focus:border-blue-500">
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
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Task' : 'Create Task')}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
