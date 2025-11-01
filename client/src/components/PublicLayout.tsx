import { PublicNavbar } from "./PublicNavbar";
import { Link } from "wouter";
import { Heart, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-muted/30" data-testid="public-footer">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
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
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dance-styles" className="text-muted-foreground hover:text-foreground">Dance Styles</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
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
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Youtube className="h-5 w-5" />
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
