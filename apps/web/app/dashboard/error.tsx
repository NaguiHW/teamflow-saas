"use client";

import styles from "./dashboard.module.scss";

const DashboardError = () => (
  <main className={styles.statusPage}>
    <h1>We could not load the workspace.</h1>
    <p>Refresh the page to try again.</p>
  </main>
);

export default DashboardError;
