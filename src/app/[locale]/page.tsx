import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const t = useTranslations();
  const tNav = useTranslations('nav');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {t('appName')}
        </h1>
        <p className="text-muted-foreground mt-6 text-lg leading-8">
          {t('tagline')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/en/auth/register">{tNav('signUp')}</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/en/auth/login">{tNav('signIn')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
