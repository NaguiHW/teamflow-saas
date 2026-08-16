import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@teamflow/types";
import TaskCard from "../app/dashboard/TaskCard";
import { messages } from "../src/i18n/messages";

const task: Task = {
  id: "task_demo",
  organizationId: "org_demo",
  projectId: "project_launch",
  title: "Review homepage messaging",
  description: "Check the hero copy against the positioning notes.",
  status: "in_progress",
  dueDate: null,
  assignee: "Maya Chen",
  labels: [],
};

describe("TaskCard", () => {
  const renderTaskCard = (nextTask: Task, isPending = false) => {
    cleanup();
    const onStatusChange = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={messages.en}>
        <TaskCard
          task={nextTask}
          onStatusChange={onStatusChange}
          isPending={isPending}
        />
      </NextIntlClientProvider>,
    );
    return onStatusChange;
  };

  it("renders task details and advances status through its action", () => {
    const onStatusChange = renderTaskCard(task);

    expect(
      screen.getByRole("heading", { name: task.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Move Review homepage messaging to Done",
      }),
    );
    expect(onStatusChange).toHaveBeenCalledWith(task.id, "done");
  });

  it("supports the first and last status transitions", () => {
    const todoTask = { ...task, status: "todo" as const };
    const onTodoStatusChange = renderTaskCard(todoTask);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Move Review homepage messaging to In progress",
      }),
    );
    expect(onTodoStatusChange).toHaveBeenCalledWith(todoTask.id, "in_progress");

    const doneTask = { ...task, status: "done" as const };
    const onDoneStatusChange = renderTaskCard(doneTask);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Move Review homepage messaging to To do",
      }),
    );
    expect(onDoneStatusChange).toHaveBeenCalledWith(doneTask.id, "todo");
  });

  it("disables the action and shows progress while the task is pending", () => {
    const onStatusChange = renderTaskCard(task, true);
    const button = screen.getByRole("button", {
      name: "Move Review homepage messaging to Done",
    });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("span")).toBeInTheDocument();
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it("renders due dates and labels", () => {
    renderTaskCard({
      ...task,
      dueDate: "2026-09-01T17:00:00.000Z",
      labels: [
        {
          id: "label_product",
          organizationId: "org_demo",
          name: "Product",
          color: "#287271",
        },
        {
          id: "label_custom",
          organizationId: "org_demo",
          name: "Custom",
          color: "#d97857",
        },
      ],
    });

    expect(screen.getByText(/Due/)).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
});
