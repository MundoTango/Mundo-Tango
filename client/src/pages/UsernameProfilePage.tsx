import { useParams, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";

interface ProPageCheck {
  id: number;
  name: string;
}

interface UserLookup {
  id: number;
  username: string;
  name: string;
}

export default function UsernameProfilePage() {
  const { t } = useTranslation(['pages', 'common']);
  const { username } = useParams<{ username: string }>();

  const { 
    data: proPage, 
    isLoading: proLoading, 
    error: proError 
  } = useQuery<ProPageCheck>({
    queryKey: ['/api/pro/page', username],
    queryFn: async () => {
      const response = await fetch(`/api/pro/page/${encodeURIComponent(username || '')}`);
      if (!response.ok) {
        throw new Error('Pro page not found');
      }
      return response.json();
    },
    enabled: !!username,
    retry: false,
  });

  const { 
    data: user, 
    isLoading: userLoading, 
    error: userError 
  } = useQuery<UserLookup>({
    queryKey: ['/api/users', username],
    queryFn: async () => {
      const response = await fetch(`/api/users/${encodeURIComponent(username || '')}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json();
    },
    enabled: !!username && !!proError,
    retry: false,
  });

  const isLoading = proLoading || (proError && userLoading);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <SEO title={`${username}`} />
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  if (proPage && !proError) {
    return <Redirect to={`/p/${encodeURIComponent(username || '')}`} />;
  }

  if (user && !userError) {
    return <Redirect to={`/profile/${user.id}`} />;
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <SEO title={t('pages:notFound.title', 'Page Not Found')} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <AlertCircle className="h-20 w-20 text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" data-testid="text-not-found-title">
            {t('pages:notFound.pageNotFound', 'Page Not Found')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md" data-testid="text-not-found-description">
            {t('pages:notFound.proPageNotFoundDescription', `The page "/${username}" doesn't exist.`)}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/">
            <Button data-testid="button-go-home">{t('common:goHome', 'Go Home')}</Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" data-testid="button-explore">
              {t('common:explorePros', 'Explore Professionals')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
