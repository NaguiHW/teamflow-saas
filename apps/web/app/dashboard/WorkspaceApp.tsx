"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Circle,
  Languages,
  LogOut,
  MoreHorizontal,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import type { Project, TaskStatus, WorkspaceResponse } from "@teamflow/types";
import {
  ApiRequestError,
  loadWorkspace,
  logout,
  updateTaskStatus,
} from "../../src/lib/teamflow-api";
import { useLocalePreference } from "../../src/i18n/LocaleProvider";
import { useTheme } from "../../src/theme/ThemeProvider";
import DashboardSkeleton from "./DashboardSkeleton";
import TaskBoard from "./TaskBoard";
import styles from "./dashboard.module.scss";

const WorkspaceApp = () => {
  const t = useTranslations("dashboard");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { locale: selectedLocale, setLocale } = useLocalePreference();
  const { theme, toggleTheme } = useTheme();
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    const loadWorkspaceData = async () => {
      try {
        const nextWorkspace = await loadWorkspace();
        setWorkspace(nextWorkspace);
        setSelectedProjectId(
          (currentProjectId) =>
            currentProjectId || nextWorkspace.projects[0]?.id || "",
        );
      } catch (requestError) {
        setError(
          requestError instanceof ApiRequestError && requestError.status === 401
            ? t("loginRequired")
            : requestError instanceof ApiRequestError &&
                requestError.code === "NO_ORGANIZATION"
              ? t("noOrganization")
              : t("unavailable"),
        );
      } finally {
        setIsLoading(false);
      }
    };
    void loadWorkspaceData();
  }, []);

  const selectedProject = workspace?.projects.find(
    (project) => project.id === selectedProjectId,
  );
  const visibleTasks = useMemo(
    () =>
      workspace?.tasks.items.filter(
        (task) => task.projectId === selectedProjectId,
      ) ?? [],
    [selectedProjectId, workspace],
  );

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!workspace || isSaving) return;
    const previousTasks = workspace.tasks.items;
    setWorkspace({
      ...workspace,
      tasks: {
        ...workspace.tasks,
        items: previousTasks.map((task) =>
          task.id === taskId ? { ...task, status } : task,
        ),
      },
    });
    setIsSaving(true);
    setPendingTaskId(taskId);
    try {
      await updateTaskStatus({
        organizationId: workspace.organization.id,
        taskId,
        status,
      });
      toast.success(t("taskUpdated"));
    } catch {
      setWorkspace({
        ...workspace,
        tasks: { ...workspace.tasks, items: previousTasks },
      });
      toast.error(t("taskUpdateFailed"));
    } finally {
      setIsSaving(false);
      setPendingTaskId(null);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  if (error || !workspace) {
    return (
      <main className={styles.statusPage}>
        <div>
          <p className={styles.kicker}>{t("unavailable")}</p>
          <h1>{error ?? "Something went wrong."}</h1>
          <Link href="/" className={styles.textLink}>
            {t("backHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <Link className={`${styles.brand} ${styles.sidebarBrand}`} href="/">
          team<span>flow</span>
        </Link>
        <div className={styles.workspacePicker}>
          <span className={styles.workspaceAvatar}>NS</span>
          <span>
            <strong>{workspace.organization.name}</strong>
            <small>
              {t("workspacePlan", { plan: workspace.organization.plan })}
            </small>
          </span>
          <ChevronDown
            className={styles.chevron}
            aria-hidden="true"
            size={16}
          />
        </div>
        <nav className={styles.nav} aria-label="Workspace navigation">
          <a className={styles.navItemActive} href="#overview">
            {t("overview")}
          </a>
          <a className={styles.navItem} href="#projects">
            {t("projects")}
          </a>
          <a className={styles.navItem} href="#activity">
            {t("activity")}
          </a>
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.userAvatar}>MC</span>
          <span>
            <strong>
              {workspace.currentUser?.displayName ??
                workspace.currentUser?.email ??
                "Team member"}
            </strong>
            <small>{t("workspaceOwner")}</small>
          </span>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Open profile menu"
            aria-expanded={isProfileMenuOpen}
            onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
          >
            <MoreHorizontal aria-hidden="true" size={18} />
          </button>
          {isProfileMenuOpen ? (
            <div className={styles.profileMenu} role="menu">
              <button
                className={styles.logoutButton}
                type="button"
                role="menuitem"
                aria-busy={isLoggingOut}
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
              >
                {isLoggingOut ? (
                  <span className={styles.buttonSpinner} aria-hidden="true" />
                ) : (
                  <LogOut aria-hidden="true" size={15} />
                )}
                {isLoggingOut ? t("signingOut") : t("signOut")}
              </button>
            </div>
          ) : null}
        </div>
      </aside>
      <main className={styles.mainContent} id="overview">
        <header className={styles.topbar}>
          <Link className={`${styles.brand} ${styles.topbarBrand}`} href="/">
            team<span>flow</span>
          </Link>
          <div>
            <p className={styles.breadcrumb}>
              {workspace.organization.name} <span>/</span> {t("overview")}
            </p>
            <p className={styles.demoTag}>
              {process.env.NEXT_PUBLIC_MOCK_API === "true"
                ? t("mockNotice")
                : "LIVE WORKSPACE"}
            </p>
          </div>
          <div className={styles.topbarActions}>
            <button
              className={styles.iconButton}
              type="button"
              aria-label={common("switchTheme")}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun aria-hidden="true" size={17} />
              ) : (
                <Moon aria-hidden="true" size={17} />
              )}
            </button>
            <button
              className={styles.iconButton}
              type="button"
              aria-label={common("switchLanguage")}
              onClick={() => setLocale(selectedLocale === "en" ? "es" : "en")}
            >
              <Languages aria-hidden="true" size={17} />
            </button>
            <button
              className={styles.avatarButton}
              type="button"
              aria-label="Open notifications"
            >
              <Bell aria-hidden="true" size={19} />
              <span>2</span>
            </button>
          </div>
        </header>
        <div className={styles.contentWrap}>
          <section className={styles.welcome}>
            <div>
              <p className={styles.kicker}>
                {new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(
                  new Date(),
                )}
              </p>
              <h1>
                {t("goodMorning", {
                  name: workspace.currentUser?.displayName ?? "Team",
                })}
              </h1>
              <p>{t("teamPulse")}</p>
            </div>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() =>
                toast.info(
                  "Create flow will connect to the API in the next phase.",
                )
              }
            >
              <Plus aria-hidden="true" size={16} />{" "}
              {t("newProject").replace("+ ", "")}
            </button>
          </section>
          <section className={styles.metrics} aria-label="Workspace summary">
            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>
                <Circle aria-hidden="true" size={18} />
              </span>
              <div>
                <strong>
                  {
                    workspace.projects.filter(
                      (project) => project.status === "active",
                    ).length
                  }
                </strong>
                <span>{t("activeProjects")}</span>
              </div>
              <small>{t("thisMonth")}</small>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>
                <ArrowUpRight aria-hidden="true" size={18} />
              </span>
              <div>
                <strong>
                  {
                    workspace.tasks.items.filter(
                      (task) => task.status === "in_progress",
                    ).length
                  }
                </strong>
                <span>{t("inProgress")}</span>
              </div>
              <small>{t("acrossTeam")}</small>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>
                <Check aria-hidden="true" size={18} />
              </span>
              <div>
                <strong>
                  {
                    workspace.tasks.items.filter(
                      (task) => task.status === "done",
                    ).length
                  }
                </strong>
                <span>{t("completedWeek")}</span>
              </div>
              <small>{t("lookingGood")}</small>
            </div>
          </section>
          <section className={styles.workspaceGrid} id="projects">
            <div className={styles.projectArea}>
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.kicker}>Your workspaces</p>
                  <h2>Projects</h2>
                </div>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() =>
                    toast.info("Project creation is mocked for now.")
                  }
                >
                  {t("viewAll")}
                </button>
              </div>
              <div className={styles.projectRail}>
                {workspace.projects
                  .filter((project) => project.status === "active")
                  .map((project: Project) => (
                    <button
                      className={
                        project.id === selectedProjectId
                          ? styles.projectCardActive
                          : styles.projectCard
                      }
                      key={project.id}
                      type="button"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <span className={styles.projectMark}>
                        {project.name.slice(0, 1)}
                      </span>
                      <span>
                        <strong>{project.name}</strong>
                        <small>
                          {project.completedTaskCount}/{project.taskCount} tasks
                          done
                        </small>
                      </span>
                      <span className={styles.projectArrow}>
                        <ArrowUpRight aria-hidden="true" size={16} />
                      </span>
                    </button>
                  ))}
              </div>
              {selectedProject ? (
                <div className={styles.selectedProject}>
                  <div>
                    <p className={styles.kicker}>{t("selectedProject")}</p>
                    <h2>{selectedProject.name}</h2>
                    <p>{selectedProject.description}</p>
                  </div>
                  <span className={styles.progressPill}>
                    {t("complete", {
                      completed: selectedProject.completedTaskCount,
                      total: selectedProject.taskCount,
                    })}
                  </span>
                </div>
              ) : null}
              <TaskBoard
                tasks={visibleTasks}
                onStatusChange={handleStatusChange}
                pendingTaskId={pendingTaskId}
              />
              {isSaving ? (
                <p className={styles.saveNote} role="status">
                  {t("saving")}
                </p>
              ) : null}
            </div>
            <aside className={styles.activity} id="activity">
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.kicker}>Team pulse</p>
                  <h2>{t("recentActivity")}</h2>
                </div>
                <button
                  className={styles.moreButton}
                  type="button"
                  aria-label={t("moreActivity")}
                >
                  <MoreHorizontal aria-hidden="true" size={18} />
                </button>
              </div>
              <div className={styles.activityList}>
                {workspace.activity.map((event) => (
                  <div className={styles.activityItem} key={event.id}>
                    <span className={styles.activityAvatar}>
                      {event.actor
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </span>
                    <p>
                      <strong>{event.actor}</strong> {event.action}{" "}
                      <b>{event.target}</b>
                      <small>{event.createdAt}</small>
                    </p>
                  </div>
                ))}
              </div>
              <button
                className={styles.activityLink}
                type="button"
                onClick={() =>
                  toast.info("The full activity history is coming soon.")
                }
              >
                {t("activityHistory")}
              </button>
            </aside>
          </section>
        </div>
      </main>
      <ToastContainer position="bottom-right" theme="light" />
    </div>
  );
};

export default WorkspaceApp;
