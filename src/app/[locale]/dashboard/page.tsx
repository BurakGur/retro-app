'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useTeams } from '@/hooks/use-teams';
import { TeamCard } from '@/components/team/team-card';
import { CreateTeamDialog } from '@/components/team/create-team-dialog';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { profile } = useAuthStore();
  const { data: teams, isLoading } = useTeams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          {profile?.display_name && (
            <p className="text-muted-foreground mt-1">
              {t('welcome', { name: profile.display_name })}
            </p>
          )}
        </div>
        <CreateTeamDialog>
          <Button>{t('teams.createButton')}</Button>
        </CreateTeamDialog>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">{t('teams.title')}</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : teams && teams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">{t('teams.empty')}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('teams.emptyAction')}
            </p>
            <CreateTeamDialog>
              <Button className="mt-4">{t('teams.createButton')}</Button>
            </CreateTeamDialog>
          </div>
        )}
      </div>
    </div>
  );
}
