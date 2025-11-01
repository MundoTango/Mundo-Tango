import { Link, useLocation } from "wouter";
import { Bell, User, Moon, Sun, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { SearchBar } from "./SearchBar";

export function GlobalTopbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const unreadNotifications = 3; // TODO: Get from API
  const unreadMessages = 5; // TODO: Get from API

  return (
    <header className="glass-topbar sticky top-0 z-50 w-full" data-testid="global-topbar">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* E101 - Logo */}
        <Link href="/feed">
          <div className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg cursor-pointer" data-testid="link-logo">
            <div className="w-8 h-8 ocean-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MT</span>
            </div>
            <span className="font-bold text-lg ocean-gradient-text hidden sm:block">Mundo Tango</span>
          </div>
        </Link>

        {/* E102 - Search */}
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* E106 - Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-language">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="menu-item-english">🇺🇸 English</DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-item-spanish">🇪🇸 Español</DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-item-portuguese">🇧🇷 Português</DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-item-french">🇫🇷 Français</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* E105 - Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Messages */}
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-messages">
              <MessageSquare className="h-5 w-5" />
              {unreadMessages > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-messages-count"
                >
                  {unreadMessages}
                </Badge>
              )}
            </Button>
          </Link>

          {/* E103 - Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-notifications-count"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </Link>

          {/* E107 - Mr Blue AI */}
          <Link href="/mr-blue">
            <Button 
              variant="ghost" 
              size="icon" 
              className="ocean-gradient text-white"
              data-testid="button-mr-blue"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>

          {/* E104 - User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage || undefined} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-semibold" data-testid="text-user-name">
                {user?.name || user?.username}
              </div>
              <div className="px-2 py-1 text-xs text-muted-foreground" data-testid="text-user-email">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation(`/profile/${user?.username}`)} data-testid="menu-item-profile">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")} data-testid="menu-item-settings">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/dashboard")} data-testid="menu-item-dashboard">
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} data-testid="menu-item-logout">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
