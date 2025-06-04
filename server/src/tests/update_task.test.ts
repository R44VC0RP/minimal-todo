
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput, type CreateTaskInput } from '../schema';
import { updateTask } from '../handlers/update_task';
import { eq } from 'drizzle-orm';

// Helper to create a test task
const createTestTask = async (taskData: CreateTaskInput = {
  description: 'Original task description',
  due_date: new Date('2024-12-31'),
  status: 'Backlog'
}) => {
  const result = await db.insert(tasksTable)
    .values({
      description: taskData.description,
      due_date: taskData.due_date,
      status: taskData.status
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task description', async () => {
    const task = await createTestTask();
    
    const updateInput: UpdateTaskInput = {
      id: task.id,
      description: 'Updated task description'
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.description).toEqual('Updated task description');
    expect(result.due_date).toEqual(task.due_date);
    expect(result.status).toEqual(task.status);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > task.updated_at).toBe(true);
  });

  it('should update task due date', async () => {
    const task = await createTestTask();
    const newDueDate = new Date('2025-01-15');
    
    const updateInput: UpdateTaskInput = {
      id: task.id,
      due_date: newDueDate
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.description).toEqual(task.description);
    expect(result.due_date).toEqual(newDueDate);
    expect(result.status).toEqual(task.status);
    expect(result.updated_at > task.updated_at).toBe(true);
  });

  it('should update task status', async () => {
    const task = await createTestTask();
    
    const updateInput: UpdateTaskInput = {
      id: task.id,
      status: 'In Progress'
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.description).toEqual(task.description);
    expect(result.due_date).toEqual(task.due_date);
    expect(result.status).toEqual('In Progress');
    expect(result.updated_at > task.updated_at).toBe(true);
  });

  it('should update multiple fields at once', async () => {
    const task = await createTestTask();
    const newDueDate = new Date('2025-02-28');
    
    const updateInput: UpdateTaskInput = {
      id: task.id,
      description: 'Completely updated task',
      due_date: newDueDate,
      status: 'Done'
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.description).toEqual('Completely updated task');
    expect(result.due_date).toEqual(newDueDate);
    expect(result.status).toEqual('Done');
    expect(result.updated_at > task.updated_at).toBe(true);
  });

  it('should save updated task to database', async () => {
    const task = await createTestTask();
    
    const updateInput: UpdateTaskInput = {
      id: task.id,
      description: 'Database update test',
      status: 'Done'
    };

    await updateTask(updateInput);

    const savedTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task.id))
      .execute();

    expect(savedTask).toHaveLength(1);
    expect(savedTask[0].description).toEqual('Database update test');
    expect(savedTask[0].status).toEqual('Done');
    expect(savedTask[0].updated_at > task.updated_at).toBe(true);
  });

  it('should throw error when task not found', async () => {
    const updateInput: UpdateTaskInput = {
      id: 99999,
      description: 'This should fail'
    };

    expect(updateTask(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should only update updated_at when no other fields provided', async () => {
    const task = await createTestTask();
    
    const updateInput: UpdateTaskInput = {
      id: task.id
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.description).toEqual(task.description);
    expect(result.due_date).toEqual(task.due_date);
    expect(result.status).toEqual(task.status);
    expect(result.updated_at > task.updated_at).toBe(true);
  });
});
