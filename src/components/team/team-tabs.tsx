'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function TeamTabs({ slug }: { slug: string }) {
  const t = useTranslations('teams.detail');
  const pathname = usePathname();

  const tabs = [
    { label: t('boards'), href: `/en/teams/${slug}` },
    { label: t('members'), href: `/en/teams/${slug}/members` },
    { label: t('settings'), href: `/en/teams/${slug}/settings` },
  ];

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-4">
        {tabs.map((tab) => {
          const isActive =
            tab.href === `/en/teams/${slug}`
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
