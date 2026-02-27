'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import {
  useTeamMembers,
  useUpdateMemberRole,
  useRemoveMember,
} from '@/hooks/use-teams';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tables } from '@/types/database';

type TeamRole = Tables<'team_members'>['role'];

export function TeamMembersList({
  teamId,
  currentUserRole,
}: {
  teamId: string;
  currentUserRole: TeamRole;
}) {
  const t = useTranslations('teams.members');
  const { user } = useAuthStore();
  const { data: members, isLoading } = useTeamMembers(teamId);
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const canManageMembers =
    currentUserRole === 'owner' || currentUserRole === 'admin';

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      {members?.map((member) => {
        const profile = member.profiles;
        const isCurrentUser = member.user_id === user?.id;
        const isOwner = member.role === 'owner';
        const initials =
          profile?.display_name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) ?? '?';

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {profile?.display_name ?? 'Unknown'}
                  {isCurrentUser && (
                    <span className="text-muted-foreground ml-1">(you)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isOwner ? 'default' : 'secondary'}>
                {t(`roles.${member.role}`)}
              </Badge>
              {canManageMembers && !isOwner && !isCurrentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ...
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(['admin', 'facilitator', 'member'] as const).map(
                      (role) =>
                        role !== member.role && (
                          <DropdownMenuItem
                            key={role}
                            onClick={() =>
                              updateRole.mutate({
                                memberId: member.id,
                                role,
                              })
                            }
                          >
                            {t('changeRole')}: {t(`roles.${role}`)}
                          </DropdownMenuItem>
                        )
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => removeMember.mutate(member.id)}
                    >
                      {t('removeMember')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {isCurrentUser && !isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeMember.mutate(member.id)}
                >
                  {t('leaveTeam')}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
