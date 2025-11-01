import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function PublicNavbar() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
    { label: "Dance Styles", path: "/dance-styles" }
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
              data-testid="button-login"
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
        </div>
      </div>
    </header>
  );
}
