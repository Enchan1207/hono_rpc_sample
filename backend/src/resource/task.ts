export type TaskPriority = "high" | "middle" | "low";

/** タスク優先順位の数値 */
export const taskPriorityLevelMap = {
  high: 100,
  middle: 50,
  low: 0,
} as const satisfies Record<TaskPriority, number>;

/** タスク */
export type Task = {
  id: number;
  title: string;
  limit: Date; // Review: use date-processing package
  priority: TaskPriority;
  description: string;
};
