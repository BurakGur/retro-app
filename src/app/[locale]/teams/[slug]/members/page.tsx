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
  const { user } = useAuthStore();
  const { data: team } = useTeam(slug);
  const { data: members } = useTeamMembers(team?.id ?? '');

  if (!team) return null;

  const currentMember = members?.find((m) => m.user_id === user?.id);
  const currentUserRole: Tables<'team_members'>['role'] =
    currentMember?.role ?? 'member';
  const canInvite =
    currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="max-w-2xl">
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
