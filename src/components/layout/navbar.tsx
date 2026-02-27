'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { UserMenu } from './user-menu';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const t = useTranslations('nav');
  const tApp = useTranslations();
  const { user, isLoading } = useAuthStore();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/en" className="text-xl font-bold">
            {tApp('appName')}
          </Link>
          {user && (
            <nav className="hidden items-center gap-4 md:flex">
              <Link
                href="/en/dashboard"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('dashboard')}
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? null : user ? (
            <UserMenu />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/en/auth/login">{t('signIn')}</Link>
              </Button>
              <Button asChild>
                <Link href="/en/auth/register">{t('signUp')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
