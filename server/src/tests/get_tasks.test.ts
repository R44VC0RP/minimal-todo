
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { getTasks } from '../handlers/get_tasks';

// Test task inputs
const testTask1: CreateTaskInput = {
  description: 'First test task',
  due_date: new Date('2024-12-31'),
  status: 'In Progress'
};

const testTask2: CreateTaskInput = {
  description: 'Second test task',
  due_date: new Date('2024-12-25'),
  status: 'Done'
};

const testTask3: CreateTaskInput = {
  description: 'Third test task',
  due_date: new Date('2024-12-20'),
  status: 'Backlog'
};

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();

    expect(result).toEqual([]);
  });

  it('should return all tasks', async () => {
    // Create test tasks
    await db.insert(tasksTable)
      .values([
        {
          description: testTask1.description,
          due_date: testTask1.due_date,
          status: testTask1.status
        },
        {
          description: testTask2.description,
          due_date: testTask2.due_date,
          status: testTask2.status
        }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    
    // Check that both tasks are returned
    const descriptions = result.map(task => task.description);
    expect(descriptions).toContain('First test task');
    expect(descriptions).toContain('Second test task');
    
    // Verify task properties
    result.forEach(task => {
      expect(task.id).toBeDefined();
      expect(task.description).toBeDefined();
      expect(task.due_date).toBeInstanceOf(Date);
      expect(['Backlog', 'In Progress', 'Done']).toContain(task.status);
      expect(task.created_at).toBeInstanceOf(Date);
      expect(task.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return tasks ordered by created_at descending', async () => {
    // Create tasks with slight delay to ensure different timestamps
    await db.insert(tasksTable)
      .values({
        description: testTask1.description,
        due_date: testTask1.due_date,
        status: testTask1.status
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(tasksTable)
      .values({
        description: testTask2.description,
        due_date: testTask2.due_date,
        status: testTask2.status
      })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(tasksTable)
      .values({
        description: testTask3.description,
        due_date: testTask3.due_date,
        status: testTask3.status
      })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    
    // Verify ordering - most recent first
    expect(result[0].description).toEqual('Third test task');
    expect(result[1].description).toEqual('Second test task');
    expect(result[2].description).toEqual('First test task');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should handle various task statuses', async () => {
    // Create tasks with different statuses
    await db.insert(tasksTable)
      .values([
        {
          description: 'Backlog task',
          due_date: new Date('2024-12-31'),
          status: 'Backlog'
        },
        {
          description: 'In progress task',
          due_date: new Date('2024-12-25'),
          status: 'In Progress'
        },
        {
          description: 'Done task',
          due_date: new Date('2024-12-20'),
          status: 'Done'
        }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    
    // Check that all statuses are represented
    const statuses = result.map(task => task.status);
    expect(statuses).toContain('Backlog');
    expect(statuses).toContain('In Progress');
    expect(statuses).toContain('Done');
  });
});
