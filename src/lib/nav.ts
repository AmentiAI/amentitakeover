import {
  LayoutDashboard,
  Calendar,
  Users,
  Target,
  CreditCard,
  Bot,
  Megaphone,
  Workflow,
  Globe,
  IdCard,
  FolderOpen,
  Star,
  BarChart3,
  Store,
  Smartphone,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendars", href: "/calendars", icon: Calendar },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Opportunities", href: "/opportunities", icon: Target },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "AI Agents", href: "/ai-agents", icon: Bot },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Automation", href: "/automation", icon: Workflow },
  { label: "Sites", href: "/sites", icon: Globe },
  { label: "Memberships", href: "/memberships", icon: IdCard },
  { label: "Media Storage", href: "/media", icon: FolderOpen },
  { label: "Reputation", href: "/reputation", icon: Star },
  { label: "Reporting", href: "/reporting", icon: BarChart3 },
  { label: "App Marketplace", href: "/marketplace", icon: Store },
  { label: "Mobile App", href: "/mobile", icon: Smartphone },
];

export const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};
