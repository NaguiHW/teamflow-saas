import type { Task, TaskStatus } from "@teamflow/types";
import { useTranslations } from "next-intl";
import TaskCard from "./TaskCard";
import styles from "./dashboard.module.scss";

type TaskBoardProps = {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  pendingTaskId: string | null;
};

const columns: Array<{
  status: TaskStatus;
  labelKey: "todo" | "inProgress" | "done";
  noteKey: "todoNote" | "inProgressNote" | "doneNote";
}> = [
  { status: "todo", labelKey: "todo", noteKey: "todoNote" },
  { status: "in_progress", labelKey: "inProgress", noteKey: "inProgressNote" },
  { status: "done", labelKey: "done", noteKey: "doneNote" },
];

const TaskBoard = ({
  tasks,
  onStatusChange,
  pendingTaskId,
}: TaskBoardProps) => {
  const t = useTranslations("dashboard");

  return (
    <section className={styles.board} aria-labelledby="task-board-heading">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>{t("execution")}</p>
          <h2 id="task-board-heading">{t("taskBoard")}</h2>
        </div>
        <span className={styles.boardCount}>
          {t("visibleTasks", { count: tasks.length })}
        </span>
      </div>
      <div className={styles.columns}>
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status,
          );
          return (
            <section
              className={styles.column}
              key={column.status}
              aria-label={t(column.labelKey)}
            >
              <div className={styles.column__heading}>
                <div>
                  <h3>{t(column.labelKey)}</h3>
                  <p>{t(column.noteKey)}</p>
                </div>
                <span>{columnTasks.length}</span>
              </div>
              <div className={styles.column__items}>
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={onStatusChange}
                      isPending={pendingTaskId === task.id}
                    />
                  ))
                ) : (
                  <div className={styles.emptyColumn}>{t("emptyColumn")}</div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
};

export default TaskBoard;
