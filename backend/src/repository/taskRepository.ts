import { TaskPriorityLevelMap, type Task } from "@/resource/task";

// in-memory storage
const tasks = new Map<Task["id"], Task>();

export const getTask = (id: Task["id"]): Task | undefined => {
  return tasks.get(id);
};

export const saveTask = (newTask: Task): Task => {
  tasks.set(newTask.id, newTask);
  return newTask;
};

export const deleteTask = (id: Task["id"]): Task | undefined => {
  const storedTask = tasks.get(id);
  if (storedTask === undefined) {
    return undefined;
  }
  tasks.delete(id);
  return storedTask;
};

export const listTasks = (
  sortBy: keyof Pick<Task, "id" | "limit" | "priority">,
  order: "asc" | "desc"
): Task[] => {
  // TODO: offsetやlimitを提供する
  const sortedTasks = Array.from(tasks.values()).sort((lhs, rhs) => {
    const sortDirection = order === "asc" ? 1 : -1;
    const lhsKey =
      sortBy !== "priority" ? lhs[sortBy] : TaskPriorityLevelMap[lhs.priority];
    const rhsKey =
      sortBy !== "priority" ? rhs[sortBy] : TaskPriorityLevelMap[rhs.priority];
    if (lhsKey > rhsKey) {
      return sortDirection;
    } else if (lhsKey < rhsKey) {
      return -sortDirection;
    } else {
      return 0;
    }
  });
  return sortedTasks;
};
