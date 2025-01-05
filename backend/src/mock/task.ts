import type { Task } from "@/resource/task";

export const createTaskMock = (task?: Partial<Task>): Task => ({
  id: 0,
  title: "",
  limit: new Date(),
  priority: "middle",
  description: "",
  ...task,
});
