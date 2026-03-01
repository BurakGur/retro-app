'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { useBoardStore } from '@/stores/board-store';
import type { Tables } from '@/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Board = Tables<'boards'>;
type Card = Tables<'cards'>;
type Vote = Tables<'votes'>;

// Fetch a single board with columns, cards, and votes
export function useBoard(boardId: string) {
  const supabase = createClient();
  const store = useBoardStore();

  return useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const [boardRes, columnsRes, cardsRes, votesRes] = await Promise.all([
        supabase
          .from('boards')
          .select('*')
          .eq('id', boardId)
          .single(),
        supabase
          .from('columns')
          .select('*')
          .eq('board_id', boardId)
          .order('sort_order', { ascending: true }),
        supabase
          .from('cards')
          .select('*')
          .eq('board_id', boardId)
          .order('sort_order', { ascending: true }),
        supabase
          .from('votes')
          .select('*')
          .eq('board_id', boardId),
      ]);

      if (boardRes.error) throw boardRes.error;
      if (columnsRes.error) throw columnsRes.error;
      if (cardsRes.error) throw cardsRes.error;
      if (votesRes.error) throw votesRes.error;

      // Hydrate Zustand store
      store.setBoard(boardRes.data);
      store.setColumns(columnsRes.data);
      store.setCards(cardsRes.data);
      store.setVotes(votesRes.data);

      return {
        board: boardRes.data,
        columns: columnsRes.data,
        cards: cardsRes.data,
        votes: votesRes.data,
      };
    },
    enabled: !!boardId,
  });
}

// Fetch boards for a team
export function useTeamBoards(teamId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['team-boards', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('*, cards(count)')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });
}

// Create a new board using the RPC function
export function useCreateBoard() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      title,
      teamId,
      template,
      maxVotes,
      customColumns,
    }: {
      title: string;
      teamId: string;
      template: Board['template'];
      maxVotes: number;
      customColumns?: { title: string; color?: string; icon?: string }[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('create_board_with_columns', {
        p_title: title,
        p_team_id: teamId,
        p_template: template,
        p_facilitator_id: user.id,
        p_max_votes: maxVotes,
        p_custom_columns: customColumns ? JSON.stringify(customColumns) : undefined,
      });

      if (error) throw error;
      return data as string; // Returns board ID
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['team-boards', variables.teamId],
      });
    },
  });
}

// Add a card with optimistic update
export function useAddCard() {
  const supabase = createClient();
  const store = useBoardStore();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      boardId,
      columnId,
      content,
    }: {
      boardId: string;
      columnId: string;
      content: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const tempId = `temp-${crypto.randomUUID()}`;
      const tempCard: Card = {
        id: tempId,
        board_id: boardId,
        column_id: columnId,
        content,
        author_id: user.id,
        is_anonymous: false,
        sort_order: Date.now(),
        group_id: null,
        created_at: new Date().toISOString(),
      };

      // Optimistic add
      store.addCardOptimistic(tempCard);

      const { data, error } = await supabase
        .from('cards')
        .insert({
          board_id: boardId,
          column_id: columnId,
          content,
          author_id: user.id,
          sort_order: Date.now(),
        })
        .select()
        .single();

      if (error) {
        // Rollback
        store.removeCardOptimistic(tempId);
        throw error;
      }

      // Replace temp card with server card
      store.removeCardOptimistic(tempId);
      store.upsertCard(data);
      return data;
    },
  });
}

// Delete a card with optimistic update
export function useDeleteCard() {
  const supabase = createClient();
  const store = useBoardStore();

  return useMutation({
    mutationFn: async (cardId: string) => {
      const card = useBoardStore.getState().cards.find((c) => c.id === cardId);

      // Optimistic remove
      store.removeCardOptimistic(cardId);

      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) {
        // Rollback
        if (card) store.addCardOptimistic(card);
        throw error;
      }
    },
  });
}

// Add a vote with optimistic update
export function useAddVote() {
  const supabase = createClient();
  const store = useBoardStore();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      boardId,
      cardId,
    }: {
      boardId: string;
      cardId: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const tempId = `temp-${crypto.randomUUID()}`;
      const tempVote: Vote = {
        id: tempId,
        board_id: boardId,
        card_id: cardId,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      // Optimistic add
      store.addVoteOptimistic(tempVote);

      const { data, error } = await supabase
        .from('votes')
        .insert({
          board_id: boardId,
          card_id: cardId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        // Rollback
        store.removeVoteOptimistic(tempId);
        throw error;
      }

      // Replace temp vote
      store.removeVoteOptimistic(tempId);
      store.upsertVote(data);
      return data;
    },
  });
}

// Remove a vote with optimistic update
export function useRemoveVote() {
  const supabase = createClient();
  const store = useBoardStore();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (cardId: string) => {
      if (!user) throw new Error('Not authenticated');

      const vote = useBoardStore
        .getState()
        .votes.find(
          (v) => v.card_id === cardId && v.user_id === user.id
        );

      if (!vote) throw new Error('Vote not found');

      // Optimistic remove
      store.removeVoteOptimistic(vote.id);

      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', vote.id);

      if (error) {
        // Rollback
        store.addVoteOptimistic(vote);
        throw error;
      }
    },
  });
}

// Update board status (facilitator phase management)
export function useUpdateBoardStatus() {
  const supabase = createClient();
  const store = useBoardStore();

  return useMutation({
    mutationFn: async ({
      boardId,
      status,
    }: {
      boardId: string;
      status: Board['status'];
    }) => {
      const previousStatus = useBoardStore.getState().board?.status;

      // Optimistic update
      store.updateBoardStatus(status);

      const updateData: Record<string, unknown> = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('boards')
        .update(updateData)
        .eq('id', boardId);

      if (error) {
        // Rollback
        if (previousStatus) store.updateBoardStatus(previousStatus);
        throw error;
      }
    },
  });
}

// Realtime subscription for a board
export function useBoardRealtime(boardId: string) {
  const store = useBoardStore();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    if (!boardId || !user) return;

    const supabase = createClient();

    const channel = supabase.channel(`board:${boardId}`, {
      config: { presence: { key: user.id } },
    });

    // Postgres Changes: cards
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cards',
        filter: `board_id=eq.${boardId}`,
      },
      (payload: RealtimePostgresChangesPayload<Card>) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          store.upsertCard(payload.new as Card);
        } else if (payload.eventType === 'DELETE') {
          store.deleteCard((payload.old as { id: string }).id);
        }
      }
    );

    // Postgres Changes: votes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `board_id=eq.${boardId}`,
      },
      (payload: RealtimePostgresChangesPayload<Vote>) => {
        if (payload.eventType === 'INSERT') {
          store.upsertVote(payload.new as Vote);
        } else if (payload.eventType === 'DELETE') {
          store.deleteVote((payload.old as { id: string }).id);
        }
      }
    );

    // Postgres Changes: boards (status changes)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'boards',
        filter: `id=eq.${boardId}`,
      },
      (payload: RealtimePostgresChangesPayload<Board>) => {
        if (payload.new && 'status' in payload.new) {
          store.updateBoardStatus((payload.new as Board).status);
        }
      }
    );

    // Presence: track online users
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const users = Object.values(presenceState)
        .flat()
        .map((p) => ({
          userId: (p as Record<string, string>).userId,
          displayName: (p as Record<string, string>).displayName,
          avatarUrl: (p as Record<string, string | null>).avatarUrl,
        }));
      store.setOnlineUsers(users);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId: user.id,
          displayName: profile?.display_name ?? 'Anonymous',
          avatarUrl: profile?.avatar_url ?? null,
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, user, profile, store]);
}
