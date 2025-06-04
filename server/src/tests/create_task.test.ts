
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { createTask } from '../handlers/create_task';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateTaskInput = {
  description: 'Test task description',
  due_date: new Date('2024-12-31'),
  status: 'In Progress'
};

// Test input without status (should default to 'Backlog')
const testInputWithDefaults: CreateTaskInput = {
  description: 'Task with default status',
  due_date: new Date('2024-12-25'),
  status: 'Backlog' // Include status field to satisfy TypeScript
};

describe('createTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a task with all fields', async () => {
    const result = await createTask(testInput);

    // Basic field validation
    expect(result.description).toEqual('Test task description');
    expect(result.due_date).toEqual(new Date('2024-12-31'));
    expect(result.status).toEqual('In Progress');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a task with default status', async () => {
    const result = await createTask(testInputWithDefaults);

    // Verify default status is applied
    expect(result.description).toEqual('Task with default status');
    expect(result.due_date).toEqual(new Date('2024-12-25'));
    expect(result.status).toEqual('Backlog'); // Should use default
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save task to database', async () => {
    const result = await createTask(testInput);

    // Query using proper drizzle syntax
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].description).toEqual('Test task description');
    expect(tasks[0].due_date).toEqual(new Date('2024-12-31'));
    expect(tasks[0].status).toEqual('In Progress');
    expect(tasks[0].created_at).toBeInstanceOf(Date);
    expect(tasks[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle different task statuses', async () => {
    const backlogTask: CreateTaskInput = {
      description: 'Backlog task',
      due_date: new Date('2024-11-15'),
      status: 'Backlog'
    };

    const doneTask: CreateTaskInput = {
      description: 'Done task',
      due_date: new Date('2024-10-01'),
      status: 'Done'
    };

    const backlogResult = await createTask(backlogTask);
    const doneResult = await createTask(doneTask);

    expect(backlogResult.status).toEqual('Backlog');
    expect(doneResult.status).toEqual('Done');
  });
});
