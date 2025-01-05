import { taskPriorityLevelMap, type Task } from "@/resource/task";

// in-memory storage
const tasks = new Map<Task["id"], Task>();

export const getTask = (id: Task["id"]): Task | undefined => {
  return tasks.get(id);
};

export const saveTask = (newTask: Task): Task["id"] => {
  tasks.set(newTask.id, newTask);
  return newTask.id;
};

export const deleteTask = (id: Task["id"]): Task | undefined => {
  const storedTask = tasks.get(id);
  if (storedTask === undefined) {
    return undefined;
  }
  tasks.delete(id);
  return storedTask;
};

export const listTask = (
  sortBy: keyof Pick<Task, "id" | "limit" | "priority">,
  order: "asc" | "desc"
): Task[] => {
  // TODO: offsetやlimitを提供する
  const sortedTasks = Array.from(tasks.values()).sort((lhs, rhs) => {
    const sortDirection = order === "asc" ? 1 : -1;
    const lhsKey =
      sortBy !== "priority" ? lhs[sortBy] : taskPriorityLevelMap[lhs.priority];
    const rhsKey =
      sortBy !== "priority" ? rhs[sortBy] : taskPriorityLevelMap[rhs.priority];
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
