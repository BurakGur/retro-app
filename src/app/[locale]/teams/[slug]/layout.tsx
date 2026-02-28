'use client';

import { use } from 'react';
import { useTeam } from '@/hooks/use-teams';
import { TeamTabs } from '@/components/team/team-tabs';

export default function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{team.name}</h1>
      </div>
      <TeamTabs slug={slug} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
