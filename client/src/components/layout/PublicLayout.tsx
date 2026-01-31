import { PublicNavbar } from "./PublicNavbar";
import { Link } from "wouter";
import { Heart, Facebook, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(['navigation', 'common']);
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-muted/30" data-testid="public-footer">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 ocean-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MT</span>
                </div>
                <span className="font-bold text-lg ocean-gradient-text">Mundo Tango</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting the global tango community
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/support" className="text-muted-foreground hover:text-foreground">Support Us</Link></li>
                <li><Link href="/supporters" className="text-muted-foreground hover:text-foreground">Our Supporters</Link></li>
                <li><Link href="/ambassadors" className="text-muted-foreground hover:text-foreground">Ambassadors</Link></li>
                <li><Link href="/volunteer" className="text-muted-foreground hover:text-foreground">Volunteer</Link></li>
                <li><Link href="/open-source" className="text-muted-foreground hover:text-foreground">Open Source</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/community-guidelines" className="text-muted-foreground hover:text-foreground">Community Guidelines</Link></li>
                <li><Link href="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
              </ul>
            </div>

            {/* Legal & Social */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm mb-4">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
              <div className="flex gap-2">
                <a href="https://www.facebook.com/mundotangolife1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com/mundotango.life/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              Made with <Heart className="h-4 w-4 text-primary fill-primary" /> for the global tango community
            </p>
            <p className="mt-2">© {new Date().getFullYear()} Mundo Tango. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
