"use client";

import type { Task, TaskStatus } from "@teamflow/types";
import { useTranslations } from "next-intl";
import styles from "./dashboard.module.scss";

type TaskCardProps = {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isPending?: boolean;
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const labelStyles: Record<string, string> = {
  label_product: styles.labelProduct,
  label_priority: styles.labelPriority,
  label_research: styles.labelResearch,
};

const TaskCard = ({
  task,
  onStatusChange,
  isPending = false,
}: TaskCardProps) => {
  const t = useTranslations("dashboard");
  const nextStatus: TaskStatus =
    task.status === "todo"
      ? "in_progress"
      : task.status === "in_progress"
        ? "done"
        : "todo";

  return (
    <article className={styles.taskCard}>
      <div className={styles.taskCard__topline}>
        <span className={styles.taskCard__status}>
          {statusLabels[task.status]}
        </span>
        <button
          className={styles.iconButton}
          type="button"
          aria-label={t("moveTask", {
            title: task.title,
            status: t(
              nextStatus === "todo"
                ? "todo"
                : nextStatus === "in_progress"
                  ? "inProgress"
                  : "done",
            ),
          })}
          aria-busy={isPending}
          disabled={isPending}
          onClick={() => onStatusChange(task.id, nextStatus)}
        >
          {isPending ? (
            <span className={styles.buttonSpinner} aria-hidden="true" />
          ) : (
            "→"
          )}
        </button>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className={styles.taskCard__footer}>
        <span>{task.assignee}</span>
        {task.dueDate ? (
          <time dateTime={task.dueDate}>
            Due{" "}
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
            }).format(new Date(task.dueDate))}
          </time>
        ) : null}
      </div>
      <div className={styles.labels}>
        {task.labels.map((label) => (
          <span
            className={`${styles.label} ${labelStyles[label.id] ?? ""}`}
            key={label.id}
          >
            {label.name}
          </span>
        ))}
      </div>
    </article>
  );
};

export default TaskCard;
