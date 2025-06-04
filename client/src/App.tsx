
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Moon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../server/src/schema';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const result = await trpc.getTasks.query();
      setTasks(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (data: CreateTaskInput) => {
    setIsLoading(true);
    try {
      const newTask = await trpc.createTask.mutate(data);
      setTasks((prev: Task[]) => [...prev, newTask]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (data: UpdateTaskInput) => {
    setIsLoading(true);
    try {
      const updatedTask = await trpc.updateTask.mutate(data);
      setTasks((prev: Task[]) => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    setIsLoading(true);
    try {
      await trpc.deleteTask.mutate({ id });
      setTasks((prev: Task[]) => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusCount = (status: string) => {
    return tasks.filter(task => task.status === status).length;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrder = { 'Backlog': 0, 'In Progress': 1, 'Done': 2 };
    const statusA = statusOrder[a.status as keyof typeof statusOrder];
    const statusB = statusOrder[b.status as keyof typeof statusOrder];
    
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto p-6 max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Moon className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Todo App</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                Backlog: {getStatusCount('Backlog')}
              </Badge>
              <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                In Progress: {getStatusCount('In Progress')}
              </Badge>
              <Badge variant="secondary" className="bg-green-900 text-green-200">
                Done: {getStatusCount('Done')}
              </Badge>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </header>

        {showAddForm && (
          <Card className="mb-6 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm
                onSubmit={handleCreateTask}
                onCancel={() => setShowAddForm(false)}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        )}

        {editingTask && (
          <Card className="mb-6 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Edit Task</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm
                initialData={editingTask}
                onSubmit={(data) => handleUpdateTask({ id: editingTask.id, ...data })}
                onCancel={() => setEditingTask(null)}
                isLoading={isLoading}
                isEditing
              />
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 text-lg">No tasks yet. Add your first task above! ✨</p>
              </CardContent>
            </Card>
          ) : (
            sortedTasks.map((task: Task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onStatusChange={(status) => handleUpdateTask({ id: task.id, status })}
                isLoading={isLoading}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
