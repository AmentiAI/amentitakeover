import {
  LayoutDashboard,
  Map,
  UserCog,
  Chrome,
  Star,
  Instagram,
  Activity,
  Gauge,
  ListTree,
  Layers,
  Mail,
  Send,
  GitBranch,
  Bot,
  Users,
  Sparkles,
  BarChart2,
  HeartPulse,
  Terminal,
  type LucideIcon,
} from "lucide-react";

export type OutreachNavGroup = {
  label?: string;
  items: { label: string; href: string; icon: LucideIcon }[];
};

export const OUTREACH_NAV: OutreachNavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/outreach", icon: LayoutDashboard }],
  },
  {
    label: "Data Scraping",
    items: [
      { label: "Scrape Map", href: "/outreach/scrape/map", icon: Map },
      { label: "Agent Details", href: "/outreach/scrape/agent", icon: UserCog },
      {
        label: "Google Businesses",
        href: "/outreach/scrape/google",
        icon: Chrome,
      },
      { label: "Yelp", href: "/outreach/scrape/yelp", icon: Star },
      { label: "Instagram", href: "/outreach/scrape/instagram", icon: Instagram },
    ],
  },
  {
    label: "Progress",
    items: [
      { label: "Industry Progress", href: "/outreach/industry", icon: Activity },
      { label: "Audited Websites", href: "/outreach/audited", icon: Gauge },
      { label: "Generation Queue", href: "/outreach/queue", icon: ListTree },
      { label: "Batch Jobs", href: "/outreach/batch", icon: Layers },
    ],
  },
  {
    label: "Outbound",
    items: [
      { label: "Email Generation", href: "/outreach/email-gen", icon: Mail },
      { label: "Email Campaigns", href: "/outreach/email-campaigns", icon: Send },
    ],
  },
  {
    label: "Business",
    items: [{ label: "Pipeline", href: "/opportunities", icon: GitBranch }],
  },
  {
    label: "Social Media",
    items: [
      {
        label: "Instagram Automation",
        href: "/outreach/instagram-auto",
        icon: Bot,
      },
      { label: "Twitter Followers", href: "/outreach/twitter", icon: Users },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "AI Usage", href: "/outreach/ai-usage", icon: Sparkles },
      { label: "API Usage", href: "/outreach/api-usage", icon: BarChart2 },
      { label: "Service Health", href: "/outreach/health", icon: HeartPulse },
      { label: "CLI Proxy", href: "/outreach/cli", icon: Terminal },
    ],
  },
];
