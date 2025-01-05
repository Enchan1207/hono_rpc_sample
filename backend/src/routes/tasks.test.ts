import { compare } from "@/logic/compare";
import { TaskPriorityLevelMap, type Task } from "@/resource/task";
import { beforeAll, describe, expect, test } from "vitest";
import app from "./tasks";

describe("単一項目の操作", () => {
  let insertedTaskId: Task["id"];

  describe("追加", async () => {
    let response: Response;

    beforeAll(async () => {
      const newTask: Omit<Task, "id"> = {
        title: "test",
        limit: new Date("2025-01-01T00:00:00.000Z"),
        priority: "high",
        description: "test task",
      };

      response = await app.request("/", {
        method: "POST",
        body: JSON.stringify(newTask),
        headers: new Headers({ "Content-Type": "application/json" }),
      });

      const taskId = (await response.json())["id"];
      insertedTaskId = taskId;
    });

    test("201が返ること", () => {
      expect(response.status).toBe(201);
    });

    test("IDが生成されること", async () => {
      expect(insertedTaskId).toBeDefined();
    });
  });

  describe("取得", async () => {
    let response: Response;

    beforeAll(async () => {
      response = await app.request(`/${insertedTaskId}`);
    });

    test("200が返ること", () => {
      expect(response.status).toBe(200);
    });

    test("挿入時と同じ内容が返ること", async () => {
      const taskData = await response.json();
      expect(taskData).toStrictEqual({
        id: insertedTaskId,
        title: "test",
        limit: "2025-01-01T00:00:00.000Z",
        priority: "high",
        description: "test task",
      });
    });
  });

  describe("更新", () => {
    let response: Response;

    beforeAll(async () => {
      const updated = {
        id: insertedTaskId,
        title: "updated title",
        priority: "low",
        description: "test task *updated*",
      };

      response = await app.request(`/${insertedTaskId}`, {
        method: "PUT",
        body: JSON.stringify(updated),
        headers: new Headers({ "Content-Type": "application/json" }),
      });
    });

    test("200が返ること", () => {
      expect(response.status).toBe(200);
    });

    test("項目が更新されていること", async () => {
      const updatedTask = await (
        await app.request(`/${insertedTaskId}`)
      ).json();
      expect(updatedTask).toStrictEqual({
        id: insertedTaskId,
        title: "updated title",
        limit: "2025-01-01T00:00:00.000Z",
        priority: "low",
        description: "test task *updated*",
      });
    });
  });

  describe("削除", () => {
    let response: Response;

    beforeAll(async () => {
      response = await app.request(`/${insertedTaskId}`, {
        method: "DELETE",
      });
    });

    test("200が返ること", () => {
      expect(response.status).toBe(200);
    });

    test("項目が削除されていること", async () => {
      const deletionResponse = await app.request(`/${insertedTaskId}`);
      expect(deletionResponse.status).toBe(404);
    });
  });
});

describe("項目のリストアップ", () => {
  let insertedTasks: Task[];

  beforeAll(async () => {
    const dummyTaskData: Omit<Task, "id">[] = Array.from({ length: 5 }).map(
      (_, i) => ({
        title: `Task-${i}`,
        limit: new Date(`2025-01-01T00:${i.toString().padStart(2, "0")}:00Z`),
        // 強引!
        priority: ["high", "middle", "low"][i % 3] as Task["priority"],
        description: "",
      })
    );

    const insertionResponses = await Promise.all(
      dummyTaskData.map((taskData) =>
        app.request("/", {
          method: "POST",
          body: JSON.stringify(taskData),
          headers: new Headers({ "Content-Type": "application/json" }),
        })
      )
    );

    insertedTasks = await Promise.all(insertionResponses.map((r) => r.json()));
  });

  // NOTE: ロジックの詳細はここでは確認しない
  test("全ての項目がIDの昇順にリストアップされること", async () => {
    const response: Task[] = await (
      await app.request("/?key=id&order=asc")
    ).json();
    const taskIds = response.map((t) => t.id);
    expect(taskIds).toStrictEqual(
      insertedTasks.toSorted(compare<Task>("id", "asc")).map((t) => t.id)
    );
  });

  test("全ての項目が優先度の昇順にリストアップされること", async () => {
    const response: Task[] = await (
      await app.request("/?key=priority&order=desc")
    ).json();
    const taskIds = response.map((t) => t.id);
    expect(taskIds).toStrictEqual(
      insertedTasks
        .toSorted((lhs, rhs) => {
          const lpr = lhs.priority;
          const rpr = rhs.priority;
          if (lpr === rpr) {
            return compare<Task>("id", "desc")(lhs, rhs);
          }
          return TaskPriorityLevelMap[rpr] - TaskPriorityLevelMap[lpr];
        })
        .map((t) => t.id)
    );
  });
});
