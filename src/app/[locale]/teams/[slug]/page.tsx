'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useTeam } from '@/hooks/use-teams';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('teams.detail');
  const { data: team, isLoading } = useTeam(slug);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Team not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{team.name}</h1>
      </div>

      <Tabs defaultValue="boards">
        <TabsList>
          <TabsTrigger value="boards">{t('boards')}</TabsTrigger>
          <TabsTrigger value="members" asChild>
            <Link href={`/en/teams/${slug}/members`}>{t('members')}</Link>
          </TabsTrigger>
          <TabsTrigger value="settings" asChild>
            <Link href={`/en/teams/${slug}/settings`}>{t('settings')}</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="boards" className="mt-6">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">{t('noBoards')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
