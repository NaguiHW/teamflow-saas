"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import DisplayControls from "../../src/components/DisplayControls";
import { getCurrentUser, login } from "../../src/lib/teamflow-api";
import styles from "./login.module.scss";

const LoginForm = () => {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(
    process.env.NEXT_PUBLIC_MOCK_API !== "true",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      setIsCheckingSession(false);
      return;
    }

    let active = true;
    void getCurrentUser()
      .then(() => router.replace("/dashboard"))
      .catch(() => {
        if (active) setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <main className={styles.page}>
        <DisplayControls />
        <div
          className={`${styles.card} ${styles.sessionStatus}`}
          role="status"
          aria-live="polite"
        >
          <Link className={styles.brand} href="/">
            team<span>flow</span>
          </Link>
          <span className={styles.loadingOrb} aria-hidden="true" />
          <p>{t("checkingSession")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <DisplayControls />
      <div className={styles.card}>
        <Link className={styles.brand} href="/">
          team<span>flow</span>
        </Link>
        <p className={styles.kicker}>Team workspace</p>
        <h1>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            {t("email")}
            <input
              autoComplete="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            {t("password")}
            <input
              autoComplete="current-password"
              minLength={8}
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button
            className={styles.submit}
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <span className={styles.submitPending}>
                <span className={styles.submitSpinner} aria-hidden="true" />
                {t("submitting")}
              </span>
            ) : (
              t("submit")
            )}
          </button>
        </form>
        <Link className={styles.backLink} href="/">
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
};

export default LoginForm;
