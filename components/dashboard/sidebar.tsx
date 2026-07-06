'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Radio,
  FileText,
  Calendar,
  Send,
  BarChart3,
  DollarSign,
  MessageSquare,
  FolderOpen,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/actions/auth';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/research', label: 'Research', icon: Search },
  { href: '/dashboard/channels', label: 'Channels', icon: Radio },
  { href: '/dashboard/content', label: 'Content', icon: FileText },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/publishing', label: 'Publishing', icon: Send },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/prompts', label: 'Prompts', icon: MessageSquare },
  { href: '/dashboard/assets', label: 'Assets', icon: FolderOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar({ workspaceName }: { workspaceName: string }) {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-white/10">
      <SidebarHeader className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold gradient-text">ContentMS</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">{workspaceName}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Command Center</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 p-4">
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start" type="submit">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}

export function DashboardShell({
  children,
  workspaceName,
}: {
  children: React.ReactNode;
  workspaceName: string;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar workspaceName={workspaceName} />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-white/10 bg-background/80 backdrop-blur-xl px-6">
          <SidebarTrigger />
          <div className="flex-1" />
          <Badge variant="outline" className="border-violet-500/30 text-violet-400">
            Human-in-the-loop
          </Badge>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
