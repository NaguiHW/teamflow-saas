import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@teamflow/types";
import TaskCard from "../app/dashboard/TaskCard";

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
  it("renders task details and advances status through its action", () => {
    const onStatusChange = vi.fn();
    render(createElement(TaskCard, { task, onStatusChange }));

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
});
