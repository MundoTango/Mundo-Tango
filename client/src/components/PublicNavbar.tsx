import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe, ChevronDown, Users, GraduationCap, CalendarCheck, Heart, Bot, Flag, HandHeart, Code } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function PublicNavbar() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Demos", path: "/demos" },
    { label: "About", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" }
  ];

  const audienceItems = [
    { label: "For Dancers", path: "/for-dancers", icon: Users },
    { label: "For Teachers", path: "/for-teachers", icon: GraduationCap },
    { label: "For Organizers", path: "/for-organizers", icon: CalendarCheck }
  ];

  const communityItems = [
    { label: "Support Us", path: "/support", icon: Heart },
    { label: "Mr. Blue AI", path: "/mr-blue", icon: Bot },
    { label: "Ambassadors", path: "/ambassadors", icon: Flag },
    { label: "Volunteer", path: "/volunteer", icon: HandHeart },
    { label: "Open Source", path: "/open-source", icon: Code }
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="public-navbar">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg cursor-pointer" data-testid="link-home">
            <div className="w-8 h-8 ocean-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MT</span>
            </div>
            <span className="font-bold text-lg ocean-gradient-text hidden sm:block">Mundo Tango</span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={isActive(item.path) ? "bg-accent" : ""}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
          
          {/* Who It's For Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={audienceItems.some(item => isActive(item.path)) ? "secondary" : "ghost"}
                className={audienceItems.some(item => isActive(item.path)) ? "bg-accent" : ""}
                data-testid="nav-who-its-for"
              >
                Who It's For
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {audienceItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2"
                    data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Community Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={communityItems.some(item => isActive(item.path)) ? "secondary" : "ghost"}
                className={communityItems.some(item => isActive(item.path)) ? "bg-accent" : ""}
                data-testid="nav-community"
              >
                Community
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {communityItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2"
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
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

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* LOGIN Button - Prominent */}
          <Link href="/login">
            <Button 
              size="default" 
              className="ocean-gradient text-white font-semibold"
              data-testid="button-nav-login"
            >
              LOGIN
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t px-4 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                size="sm"
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={isActive(item.path) ? "bg-accent" : ""}
                data-testid={`nav-mobile-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
          {audienceItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                size="sm"
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={isActive(item.path) ? "bg-accent" : ""}
                data-testid={`nav-mobile-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon className="h-3 w-3 mr-1" />
                {item.label}
              </Button>
            </Link>
          ))}
          {communityItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                size="sm"
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={isActive(item.path) ? "bg-accent" : ""}
                data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="h-3 w-3 mr-1" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
