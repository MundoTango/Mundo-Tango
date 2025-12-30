import { useParams, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";

interface UserLookup {
  id: number;
  username: string;
  name: string;
}

export default function UsernameProfilePage() {
  const { t } = useTranslation(['pages', 'common']);
  const { username } = useParams<{ username: string }>();

  const { data: user, isLoading, error } = useQuery<UserLookup>({
    queryKey: ['/api/users', username],
    queryFn: async () => {
      const response = await fetch(`/api/users/${encodeURIComponent(username || '')}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json();
    },
    enabled: !!username,
    retry: false,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <SEO title={`@${username}`} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <SEO title={t('pages:notFound.title', 'User Not Found')} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md mx-auto px-4">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold">{t('pages:notFound.userNotFound', 'User Not Found')}</h1>
            <p className="text-muted-foreground">
              {t('pages:notFound.userNotFoundDescription', `The user "@${username}" doesn't exist or their profile is private.`)}
            </p>
            <Link href="/">
              <Button data-testid="button-go-home">{t('common:goHome', 'Go Home')}</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return <Redirect to={`/profile/${user.id}`} />;
}
