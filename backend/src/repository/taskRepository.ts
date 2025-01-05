import { compare } from "@/logic/compare";
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
  if (sortBy === "id") {
    return Array.from(tasks.values()).toSorted(compare<Task>(sortBy, order));
  }

  if (sortBy === "limit") {
    return Array.from(tasks.values()).toSorted(
      // 同じ期限ならIDで比較する
      compare<Task>(sortBy, order, compare<Task>("id", order))
    );
  }

  const sortedTasks = Array.from(tasks.values()).toSorted((lhs, rhs) => {
    const lpr = lhs.priority;
    const rpr = rhs.priority;
    if (lpr === rpr) {
      // 同じ優先度ならIDで比較する
      return compare<Task>("id", order)(lhs, rhs);
    }

    // 優先度は数値に変換して比較する
    const lprLevel = TaskPriorityLevelMap[lpr];
    const rprLevel = TaskPriorityLevelMap[rpr];
    const direction = order === "asc" ? 1 : -1;
    return (lprLevel > rprLevel ? 1 : -1) * direction;
  });
  return sortedTasks;
};
