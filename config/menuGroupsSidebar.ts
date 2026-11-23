import {
  CheckSquare,
  FileText,
  LayoutDashboard,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";
import { type ElementType } from "react";

const iconMap: Record<string, ElementType> = {
  dashboard: LayoutDashboard,
  clients: Users,
  invoices: FileText,
  tasks: CheckSquare,
  settings: Settings,
  profile: UserIcon,
};

type Role = "OWNER" | "ADMIN" | "MEMBER";

export type MenuItem = {
  title: string;
  url: string;
  icon?: keyof typeof iconMap;
  roles?: Role[];
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export const menuGroups: MenuGroup[] = [
  {
    title: "Utama",
    items: [{ title: "Dashboard", url: "/dashboard", icon: "dashboard" }],
  },
  {
    title: "CRM",
    items: [{ title: "Klien", url: "/dashboard/clients", icon: "clients" }],
  },
  {
    title: "Penagihan",
    items: [
      {
        title: "Invoice",
        url: "/dashboard/invoices",
        icon: "invoices",
        roles: ["OWNER", "ADMIN"],
      },
    ],
  },
  {
    title: "Pekerjaan",
    items: [{ title: "Tugas", url: "/dashboard/tasks", icon: "tasks" }],
  },
  {
    title: "Pengaturan",
    items: [
      {
        title: "Workspace & Tim",
        url: "/dashboard/settings",
        icon: "settings",
        roles: ["OWNER", "ADMIN"],
      },
      { title: "Profil", url: "/dashboard/profile", icon: "profile" },
    ],
  },
];

export { iconMap };
