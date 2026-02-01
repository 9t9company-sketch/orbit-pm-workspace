import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Clock,
  MessageSquare,
  Bell,
  Zap,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Target,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { mockWorkspace } from "@/data/mockData";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Tasks", href: "/tasks", icon: CheckSquare, badge: 3 },
  { title: "Sprints", href: "/sprints", icon: Target },
  { title: "Team", href: "/team", icon: Users },
  { title: "Time Tracking", href: "/time", icon: Clock },
];

const secondaryNavItems: NavItem[] = [
  { title: "Docs & Wiki", href: "/docs", icon: FileText },
  { title: "Messages", href: "/messages", icon: MessageSquare, badge: 2 },
  { title: "Notifications", href: "/notifications", icon: Bell, badge: 4 },
  { title: "Automations", href: "/automations", icon: Zap },
  { title: "Reports", href: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo & Workspace */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg orbit-gradient">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-sm text-sidebar-foreground truncate">
              OrbitPM
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {mockWorkspace.name}
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>

        <div className="py-4">
          <div className={cn("h-px bg-sidebar-border", collapsed ? "mx-2" : "mx-1")} />
        </div>

        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavItemLink
          item={{ title: "Settings", href: "/settings", icon: Settings }}
          collapsed={collapsed}
          isActive={location.pathname === "/settings"}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

function NavItemLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const linkContent = (
    <NavLink
      to={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent text-sidebar-foreground orbit-glow-sm",
        collapsed && "justify-center px-2"
      )}
    >
      <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">{linkContent}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.title}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
