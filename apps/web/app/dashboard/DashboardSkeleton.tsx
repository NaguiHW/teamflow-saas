"use client";

import { useTranslations } from "next-intl";
import styles from "./dashboard.module.scss";

const DashboardSkeleton = () => {
  const t = useTranslations("dashboard");

  return (
    <main
      className={styles.skeletonPage}
      aria-busy="true"
      aria-live="polite"
      aria-label={t("loading")}
    >
      <div className={styles.skeletonTopbar}>
        <span className={`${styles.skeletonBlock} ${styles.skeletonBrand}`} />
        <span
          className={`${styles.skeletonBlock} ${styles.skeletonBreadcrumb}`}
        />
        <span className={`${styles.skeletonBlock} ${styles.skeletonActions}`} />
      </div>
      <div className={styles.skeletonContent}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonKicker}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonIntro}`} />
        <div className={styles.skeletonMetrics}>
          {Array.from({ length: 3 }, (_, index) => (
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonMetric}`}
              key={index}
            />
          ))}
        </div>
        <div className={styles.skeletonWorkspace}>
          <div>
            <div
              className={`${styles.skeletonBlock} ${styles.skeletonSection}`}
            />
            <div className={styles.skeletonProjects}>
              {Array.from({ length: 3 }, (_, index) => (
                <span
                  className={`${styles.skeletonBlock} ${styles.skeletonProject}`}
                  key={index}
                />
              ))}
            </div>
            <div
              className={`${styles.skeletonBlock} ${styles.skeletonSelected}`}
            />
            <div className={styles.skeletonBoard}>
              {Array.from({ length: 3 }, (_, index) => (
                <span
                  className={`${styles.skeletonBlock} ${styles.skeletonColumn}`}
                  key={index}
                />
              ))}
            </div>
          </div>
          <span
            className={`${styles.skeletonBlock} ${styles.skeletonActivity}`}
          />
        </div>
      </div>
    </main>
  );
};

export default DashboardSkeleton;
