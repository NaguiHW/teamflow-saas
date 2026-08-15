"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import type { Project, TaskStatus, WorkspaceResponse } from "@teamflow/types";
import TaskBoard from "./TaskBoard";
import styles from "./dashboard.module.scss";

const WorkspaceApp = () => {
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("project_launch");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const response = await fetch("/mock-api/workspace");
        if (!response.ok) throw new Error("Workspace could not be loaded.");
        setWorkspace((await response.json()) as WorkspaceResponse);
      } catch {
        setError(
          "The demo workspace could not load. Check that mock mode is enabled.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    void loadWorkspace();
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
    if (!workspace) return;
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
    try {
      const response = await fetch(`/mock-api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Task update failed.");
      toast.success("Task status updated");
    } catch {
      setWorkspace({
        ...workspace,
        tasks: { ...workspace.tasks, items: previousTasks },
      });
      toast.error("We could not update that task");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.statusPage}>
        <span className={styles.loadingOrb} />
        Loading your workspace…
      </main>
    );
  }
  if (error || !workspace) {
    return (
      <main className={styles.statusPage}>
        <div>
          <p className={styles.kicker}>Demo unavailable</p>
          <h1>{error ?? "Something went wrong."}</h1>
          <Link href="/" className={styles.textLink}>
            Back to home
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
            <small>{workspace.organization.plan} plan</small>
          </span>
          <span className={styles.chevron}>⌄</span>
        </div>
        <nav className={styles.nav} aria-label="Workspace navigation">
          <a className={styles.navItemActive} href="#overview">
            Overview
          </a>
          <a className={styles.navItem} href="#projects">
            Projects
          </a>
          <a className={styles.navItem} href="#activity">
            Activity
          </a>
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.userAvatar}>MC</span>
          <span>
            <strong>Maya Chen</strong>
            <small>Workspace owner</small>
          </span>
          <button className={styles.iconButton} aria-label="Open profile menu">
            ···
          </button>
        </div>
      </aside>
      <main className={styles.mainContent} id="overview">
        <header className={styles.topbar}>
          <Link className={`${styles.brand} ${styles.topbarBrand}`} href="/">
            team<span>flow</span>
          </Link>
          <div>
            <p className={styles.breadcrumb}>
              Northstar Studio <span>/</span> Overview
            </p>
            <p className={styles.demoTag}>
              MOCK WORKSPACE · No real data is changed
            </p>
          </div>
          <button
            className={styles.avatarButton}
            type="button"
            aria-label="Open notifications"
          >
            ✦<span>2</span>
          </button>
        </header>
        <div className={styles.contentWrap}>
          <section className={styles.welcome}>
            <div>
              <p className={styles.kicker}>Tuesday, August 18, 2026</p>
              <h1>Good morning, Maya.</h1>
              <p>Here’s the pulse of your team’s work today.</p>
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
              + New project
            </button>
          </section>
          <section className={styles.metrics} aria-label="Workspace summary">
            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>◌</span>
              <div>
                <strong>
                  {
                    workspace.projects.filter(
                      (project) => project.status === "active",
                    ).length
                  }
                </strong>
                <span>Active projects</span>
              </div>
              <small>+1 this month</small>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>↗</span>
              <div>
                <strong>
                  {
                    workspace.tasks.items.filter(
                      (task) => task.status === "in_progress",
                    ).length
                  }
                </strong>
                <span>In progress</span>
              </div>
              <small>Across your team</small>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>✓</span>
              <div>
                <strong>
                  {
                    workspace.tasks.items.filter(
                      (task) => task.status === "done",
                    ).length
                  }
                </strong>
                <span>Completed this week</span>
              </div>
              <small>Looking good</small>
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
                  View all →
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
                      <span className={styles.projectArrow}>↗</span>
                    </button>
                  ))}
              </div>
              {selectedProject ? (
                <div className={styles.selectedProject}>
                  <div>
                    <p className={styles.kicker}>Selected project</p>
                    <h2>{selectedProject.name}</h2>
                    <p>{selectedProject.description}</p>
                  </div>
                  <span className={styles.progressPill}>
                    {selectedProject.completedTaskCount} of{" "}
                    {selectedProject.taskCount} complete
                  </span>
                </div>
              ) : null}
              <TaskBoard
                tasks={visibleTasks}
                onStatusChange={handleStatusChange}
              />
              {isSaving ? (
                <p className={styles.saveNote} role="status">
                  Saving your change…
                </p>
              ) : null}
            </div>
            <aside className={styles.activity} id="activity">
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.kicker}>Team pulse</p>
                  <h2>Recent activity</h2>
                </div>
                <button
                  className={styles.moreButton}
                  type="button"
                  aria-label="More activity options"
                >
                  ···
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
                View activity history →
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
