import type {
  ActivityEvent,
  Label,
  Organization,
  Project,
  Task,
} from "@teamflow/types";

export const demoOrganization: Organization = {
  id: "org_demo",
  name: "Northstar Studio",
  plan: "pro",
  memberCount: 12,
};

export const demoLabels: Label[] = [
  {
    id: "label_product",
    organizationId: "org_demo",
    name: "Product",
    color: "#3f7cac",
  },
  {
    id: "label_priority",
    organizationId: "org_demo",
    name: "Priority",
    color: "#d97757",
  },
  {
    id: "label_research",
    organizationId: "org_demo",
    name: "Research",
    color: "#8a6fbf",
  },
];

export const demoProjects: Project[] = [
  {
    id: "project_launch",
    organizationId: "org_demo",
    name: "Website launch",
    slug: "website-launch",
    description: "Make the new TeamFlow experience ready for a public launch.",
    status: "active",
    taskCount: 8,
    completedTaskCount: 3,
  },
  {
    id: "project_operations",
    organizationId: "org_demo",
    name: "Operations system",
    slug: "operations-system",
    description: "Create a reliable rhythm for weekly team operations.",
    status: "active",
    taskCount: 5,
    completedTaskCount: 2,
  },
  {
    id: "project_archive",
    organizationId: "org_demo",
    name: "Spring campaign",
    slug: "spring-campaign",
    description: "A completed campaign workspace kept for reference.",
    status: "archived",
    taskCount: 11,
    completedTaskCount: 11,
  },
];

export const demoTasks: Task[] = [
  {
    id: "task_homepage",
    organizationId: "org_demo",
    projectId: "project_launch",
    title: "Review homepage messaging",
    description: "Check the hero copy against the positioning notes.",
    status: "in_progress",
    dueDate: "2026-08-18T00:00:00.000Z",
    assignee: "Maya Chen",
    labels: [demoLabels[0]],
  },
  {
    id: "task_demo",
    organizationId: "org_demo",
    projectId: "project_launch",
    title: "Record product walkthrough",
    description: "Capture the 90-second flow for the public demo.",
    status: "todo",
    dueDate: "2026-08-20T00:00:00.000Z",
    assignee: "Jordan Lee",
    labels: [demoLabels[1]],
  },
  {
    id: "task_qa",
    organizationId: "org_demo",
    projectId: "project_launch",
    title: "Run accessibility pass",
    description: "Review keyboard navigation and contrast before launch.",
    status: "done",
    dueDate: null,
    assignee: "Sam Rivera",
    labels: [demoLabels[2]],
  },
  {
    id: "task_weekly",
    organizationId: "org_demo",
    projectId: "project_operations",
    title: "Prepare weekly planning agenda",
    description: "Collect decisions, risks, and owners for Monday.",
    status: "todo",
    dueDate: "2026-08-21T00:00:00.000Z",
    assignee: "Maya Chen",
    labels: [demoLabels[0]],
  },
  {
    id: "task_metrics",
    organizationId: "org_demo",
    projectId: "project_operations",
    title: "Define team health signals",
    description: "Choose three signals for the first activity dashboard.",
    status: "in_progress",
    dueDate: "2026-08-23T00:00:00.000Z",
    assignee: "Jordan Lee",
    labels: [demoLabels[2]],
  },
];

export const demoActivity: ActivityEvent[] = [
  {
    id: "activity_1",
    actor: "Maya Chen",
    action: "moved",
    target: "Review homepage messaging",
    createdAt: "18 min ago",
  },
  {
    id: "activity_2",
    actor: "Jordan Lee",
    action: "completed",
    target: "Set up demo workspace",
    createdAt: "2 hr ago",
  },
  {
    id: "activity_3",
    actor: "Sam Rivera",
    action: "commented on",
    target: "Run accessibility pass",
    createdAt: "Yesterday",
  },
];
