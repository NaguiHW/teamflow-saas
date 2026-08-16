"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@teamflow/ui/Button";
import DisplayControls from "../src/components/DisplayControls";
import { getCurrentUser } from "../src/lib/teamflow-api";
import styles from "./page.module.scss";

type AuthStatus = "loading" | "authenticated" | "anonymous";

const HomePage = () => {
  const t = useTranslations("home");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navigationPath, setNavigationPath] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    process.env.NEXT_PUBLIC_MOCK_API === "true" ? "anonymous" : "loading",
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") return;
    let active = true;

    void getCurrentUser()
      .then(() => {
        if (active) setAuthStatus("authenticated");
      })
      .catch(() => {
        if (active) setAuthStatus("anonymous");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNavigation = (path: string) => {
    setNavigationPath(path);
    startTransition(() => router.push(path));
  };

  return (
    <main className={styles.page}>
      <DisplayControls />
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p className={styles.description}>{t("description")}</p>
        <div className={styles.heroLink}>
          <Button
            label={
              isPending && navigationPath === "/dashboard"
                ? t("opening")
                : t("exploreWorkspace")
            }
            isLoading={isPending && navigationPath === "/dashboard"}
            onClick={() => handleNavigation("/dashboard")}
          />
        </div>
        {authStatus === "anonymous" ? (
          <div className={styles.heroLink}>
            <Button
              label={
                isPending && navigationPath === "/login"
                  ? t("opening")
                  : t("signInWorkspace")
              }
              isLoading={isPending && navigationPath === "/login"}
              onClick={() => handleNavigation("/login")}
            />
          </div>
        ) : null}
        <p className={styles.statuses}>
          {t("statusList", {
            statuses: [t("todo"), t("inProgress"), t("done")].join(" · "),
          })}
        </p>
      </section>
    </main>
  );
};

export default HomePage;
