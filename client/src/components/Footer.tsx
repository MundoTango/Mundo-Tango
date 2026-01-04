import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Heart, Facebook, Instagram, DollarSign } from "lucide-react";

export function Footer() {
  const { t } = useTranslation(['navigation', 'common']);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mundo Tango</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('common:footerTagline', 'Where Tango Meets Community. Connect with dancers worldwide, discover events, and share your passion for Argentine tango.')}
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/mundotangolife1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-facebook"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/mundotango.life/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-instagram"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('common:quickLinks', 'Quick Links')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-about">
                    {t('navigation:footer.about')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/discover">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-discover">
                    {t('common:discoverEvents', 'Discover Events')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/teachers">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-teachers">
                    {t('common:findTeachers', 'Find Teachers')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/volunteer">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-volunteer">
                    {t('navigation:footer.volunteer')}
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('common:resources', 'Resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/community-guidelines">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-guidelines">
                    {t('navigation:footer.guidelines')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-help">
                    {t('navigation:resources.help')}
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('navigation:footer.legal')}</h3>
            <ul className="space-y-2 text-sm mb-6">
              <li>
                <Link href="/terms">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">
                    {t('navigation:footer.terms')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
                    {t('navigation:footer.privacy')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact">
                    {t('navigation:footer.contact')}
                  </a>
                </Link>
              </li>
            </ul>

            {/* GoFundMe Support */}
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-sm">{t('navigation:footer.support')}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {t('common:supportDescription', 'Help us build the future of tango technology')}
              </p>
              <a 
                href="https://www.gofundme.com/f/join-us-in-bringing-mundo-tango-to-life" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                data-testid="link-gofundme"
              >
                <DollarSign className="h-4 w-4" />
                {t('common:donateGoFundMe', 'Donate on GoFundMe')}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} {t('common:copyright', 'Mundo Tango. Built with love for the global tango community.')}
          </p>
        </div>
      </div>
    </footer>
  );
}
