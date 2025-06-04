
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // Create a test task first
    const createResult = await db.insert(tasksTable)
      .values({
        description: 'Test task to delete',
        due_date: new Date('2024-12-31'),
        status: 'Backlog'
      })
      .returning()
      .execute();

    const createdTask = createResult[0];
    const input: DeleteTaskInput = { id: createdTask.id };

    // Delete the task
    const result = await deleteTask(input);

    expect(result.success).toBe(true);

    // Verify task was deleted from database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(tasks).toHaveLength(0);
  });

  it('should return false when task does not exist', async () => {
    const input: DeleteTaskInput = { id: 999 };

    const result = await deleteTask(input);

    expect(result.success).toBe(false);
  });

  it('should not affect other tasks when deleting', async () => {
    // Create multiple test tasks
    const createResults = await db.insert(tasksTable)
      .values([
        {
          description: 'Task 1',
          due_date: new Date('2024-12-31'),
          status: 'Backlog'
        },
        {
          description: 'Task 2',
          due_date: new Date('2024-12-31'),
          status: 'In Progress'
        }
      ])
      .returning()
      .execute();

    const taskToDelete = createResults[0];
    const taskToKeep = createResults[1];

    // Delete one task
    const input: DeleteTaskInput = { id: taskToDelete.id };
    const result = await deleteTask(input);

    expect(result.success).toBe(true);

    // Verify only the targeted task was deleted
    const remainingTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(remainingTasks).toHaveLength(1);
    expect(remainingTasks[0].id).toBe(taskToKeep.id);
    expect(remainingTasks[0].description).toBe('Task 2');
  });
});
