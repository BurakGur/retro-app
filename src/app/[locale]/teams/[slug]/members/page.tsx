'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useTeam, useTeamMembers } from '@/hooks/use-teams';
import { useAuthStore } from '@/stores/auth-store';
import { TeamMembersList } from '@/components/team/team-members-list';
import { InviteLink } from '@/components/team/invite-link';
import { Separator } from '@/components/ui/separator';
import type { Tables } from '@/types/database';

export default function TeamMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('teams.members');
  const { user } = useAuthStore();
  const { data: team, isLoading: teamLoading } = useTeam(slug);
  const { data: members } = useTeamMembers(team?.id ?? '');

  if (teamLoading) {
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

  const currentMember = members?.find((m) => m.user_id === user?.id);
  const currentUserRole: Tables<'team_members'>['role'] =
    currentMember?.role ?? 'member';
  const canInvite =
    currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      {canInvite && team.invite_code && (
        <>
          <InviteLink inviteCode={team.invite_code} />
          <Separator className="my-6" />
        </>
      )}

      <TeamMembersList teamId={team.id} currentUserRole={currentUserRole} />
    </div>
  );
}
