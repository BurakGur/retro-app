'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { generateSlug } from '@/lib/validations/team';
import type { Tables } from '@/types/database';

type Team = Tables<'teams'>;
type TeamMember = Tables<'team_members'> & {
  profiles: Tables<'profiles'> | null;
};

export function useTeams() {
  const supabase = createClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, team_members(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTeam(slug: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['team', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useTeamMembers(teamId: string) {
  const supabase = createClient();

  return useQuery<TeamMember[]>({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*, profiles(*)')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');

      const slug = generateSlug(name);

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ name, slug, owner_id: user.id })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({ team_id: team.id, user_id: user.id, role: 'owner' });

      if (memberError) throw memberError;

      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useUpdateTeam() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', data.slug] });
    },
  });
}

export function useDeleteTeam() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useUpdateMemberRole() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: Team['owner_id'] extends string ? 'admin' | 'facilitator' | 'member' : never;
    }) => {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}

export function useRemoveMember() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}

export function useJoinTeam() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('Not authenticated');

      // Find team by invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (teamError) throw new Error('Invalid invite code');

      // Check if already a member
      const { data: existing } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (existing) return { team, alreadyMember: true };

      // Join as member
      const { error: joinError } = await supabase
        .from('team_members')
        .insert({ team_id: team.id, user_id: user.id, role: 'member' });

      if (joinError) throw joinError;

      return { team, alreadyMember: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
