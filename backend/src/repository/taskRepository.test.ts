import type { Task } from "@/resource/task";
import { ulid } from "ulid";
import { beforeAll, describe, expect, test } from "vitest";
import { deleteTask, getTask, listTasks, saveTask } from "./taskRepository";

describe("単一項目のCRUD", () => {
  let storedTaskId: Task["id"];

  test("項目を作成できること", () => {
    const newTask: Task = {
      id: ulid(),
      title: "test task",
      limit: new Date(),
      priority: "middle",
      description: "",
    };
    const insertedTask = saveTask(newTask);
    expect(insertedTask).toBeDefined();
    storedTaskId = insertedTask.id;
  });

  test("IDを指定して項目を取得できること", () => {
    const storedTask = getTask(storedTaskId);
    expect(storedTask).toBeDefined();
  });

  test("既存の項目を更新できること", () => {
    const storedTask = getTask(storedTaskId)!;
    const updated: Task = {
      ...storedTask,
      title: "Updated",
      priority: "high",
      description: "updated description",
    };
    saveTask(updated);

    const updatedTask = getTask(storedTaskId);
    expect(updatedTask).toBe(updated);
  });

  test("項目を削除できること", () => {
    const deletedTask = deleteTask(storedTaskId)!;
    expect(getTask(deletedTask.id)).toBeUndefined();
  });
});

describe("複数項目のリストとソート", () => {
  const dummyTasks: Task[] = Array.from({ length: 5 }).map((_, i) => ({
    id: i.toString(),
    title: `Task-${i}`,
    limit: new Date(`2025-01-01T00:${i.toString().padStart(2, "0")}:00Z`),
    // 強引!
    priority: ["high", "middle", "low"][i % 3] as Task["priority"],
    description: `task #${i} info`,
  }));

  beforeAll(() => {
    dummyTasks.forEach((task) => saveTask(task));
  });

  describe("IDでソート", () => {
    test("昇順", () => {
      const taskIds = listTasks("id", "asc").map(({ id }) => id);
      expect(taskIds).toStrictEqual([0, 1, 2, 3, 4].map((n) => n.toString()));
    });

    test("降順", () => {
      const taskIds = listTasks("id", "desc").map(({ id }) => id);
      expect(taskIds).toStrictEqual([4, 3, 2, 1, 0].map((n) => n.toString()));
    });
  });

  describe("期限でソート", () => {
    test("昇順", () => {
      const taskIds = listTasks("limit", "asc").map(({ id }) => id);
      expect(taskIds).toStrictEqual([0, 1, 2, 3, 4].map((n) => n.toString()));
    });

    test("降順", () => {
      const taskIds = listTasks("limit", "desc").map(({ id }) => id);
      expect(taskIds).toStrictEqual([4, 3, 2, 1, 0].map((n) => n.toString()));
    });
  });

  describe("優先度でソート", () => {
    test("昇順", () => {
      const taskIds = listTasks("priority", "asc").map(({ id }) => id);
      expect(taskIds).toStrictEqual([2, 1, 4, 0, 3].map((n) => n.toString()));
    });

    test("降順", () => {
      const taskIds = listTasks("priority", "desc").map(({ id }) => id);
      expect(taskIds).toStrictEqual([3, 0, 4, 1, 2].map((n) => n.toString()));
    });
  });
});
