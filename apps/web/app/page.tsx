import type { TaskStatus } from "@teamflow/types";
import Link from "next/link";
import Button from "@teamflow/ui/Button";
import styles from "./page.module.scss";

const taskStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

const HomePage = () => (
  <main className={styles.page}>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Team operations, in one flow</p>
      <h1>Make team work visible.</h1>
      <p className={styles.description}>
        TeamFlow gives organizations a clear place to turn projects into
        accountable, collaborative tasks.
      </p>
      <Link className={styles.heroLink} href="/dashboard">
        <Button label="Explore the workspace" />
      </Link>
      <p className={styles.statuses}>
        Shared task statuses: {taskStatuses.join(" · ")}
      </p>
    </section>
  </main>
);

export default HomePage;
