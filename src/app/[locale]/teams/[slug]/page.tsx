'use client';

import { useTranslations } from 'next-intl';

export default function TeamPage() {
  const t = useTranslations('teams.detail');

  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="text-muted-foreground">{t('noBoards')}</p>
    </div>
  );
}
