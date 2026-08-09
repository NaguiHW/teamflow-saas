export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskSummary = {
  id: string;
  title: string;
  status: TaskStatus;
};
