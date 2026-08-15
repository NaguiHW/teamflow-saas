import type { Task, TaskStatus } from "@teamflow/types";
import TaskCard from "./TaskCard";
import styles from "./dashboard.module.scss";

type TaskBoardProps = {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
};

const columns: Array<{ status: TaskStatus; label: string; note: string }> = [
  { status: "todo", label: "To do", note: "Ready to pick up" },
  { status: "in_progress", label: "In progress", note: "Moving forward" },
  { status: "done", label: "Done", note: "Shipped or resolved" },
];

const TaskBoard = ({ tasks, onStatusChange }: TaskBoardProps) => (
  <section className={styles.board} aria-labelledby="task-board-heading">
    <div className={styles.sectionHeading}>
      <div>
        <p className={styles.kicker}>Execution</p>
        <h2 id="task-board-heading">Task board</h2>
      </div>
      <span className={styles.boardCount}>{tasks.length} visible tasks</span>
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
            aria-label={column.label}
          >
            <div className={styles.column__heading}>
              <div>
                <h3>{column.label}</h3>
                <p>{column.note}</p>
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
                  />
                ))
              ) : (
                <div className={styles.emptyColumn}>Nothing here yet.</div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  </section>
);

export default TaskBoard;
