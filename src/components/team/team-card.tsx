'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TeamWithCount {
  id: string;
  name: string;
  slug: string;
  team_members: { count: number }[];
}

export function TeamCard({ team }: { team: TeamWithCount }) {
  const t = useTranslations('dashboard.teams');
  const memberCount = team.team_members?.[0]?.count ?? 0;

  return (
    <Link href={`/en/teams/${team.slug}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
          <CardDescription>
            {t('membersCount', { count: memberCount })}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
