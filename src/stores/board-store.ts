import { create } from 'zustand';
import type { Tables } from '@/types/database';

type Board = Tables<'boards'>;
type Column = Tables<'columns'>;
type Card = Tables<'cards'>;
type Vote = Tables<'votes'>;

interface OnlineUser {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

interface BoardState {
  board: Board | null;
  columns: Column[];
  cards: Card[];
  votes: Vote[];
  onlineUsers: OnlineUser[];

  // Setters
  setBoard: (board: Board | null) => void;
  setColumns: (columns: Column[]) => void;
  setCards: (cards: Card[]) => void;
  setVotes: (votes: Vote[]) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;

  // Optimistic card operations
  addCardOptimistic: (card: Card) => void;
  removeCardOptimistic: (cardId: string) => void;

  // Optimistic vote operations
  addVoteOptimistic: (vote: Vote) => void;
  removeVoteOptimistic: (voteId: string) => void;

  // Realtime reconciliation
  upsertCard: (card: Card) => void;
  deleteCard: (cardId: string) => void;
  upsertVote: (vote: Vote) => void;
  deleteVote: (voteId: string) => void;
  updateBoardStatus: (status: Board['status']) => void;

  // Reset
  reset: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  columns: [],
  cards: [],
  votes: [],
  onlineUsers: [],

  setBoard: (board) => set({ board }),
  setColumns: (columns) => set({ columns }),
  setCards: (cards) => set({ cards }),
  setVotes: (votes) => set({ votes }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addCardOptimistic: (card) =>
    set((state) => ({ cards: [...state.cards, card] })),

  removeCardOptimistic: (cardId) =>
    set((state) => ({ cards: state.cards.filter((c) => c.id !== cardId) })),

  addVoteOptimistic: (vote) =>
    set((state) => ({ votes: [...state.votes, vote] })),

  removeVoteOptimistic: (voteId) =>
    set((state) => ({ votes: state.votes.filter((v) => v.id !== voteId) })),

  upsertCard: (card) =>
    set((state) => {
      const exists = state.cards.find((c) => c.id === card.id);
      if (exists) {
        return { cards: state.cards.map((c) => (c.id === card.id ? card : c)) };
      }
      return { cards: [...state.cards, card] };
    }),

  deleteCard: (cardId) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== cardId),
      votes: state.votes.filter((v) => v.card_id !== cardId),
    })),

  upsertVote: (vote) =>
    set((state) => {
      const exists = state.votes.find((v) => v.id === vote.id);
      if (exists) return state;
      return { votes: [...state.votes, vote] };
    }),

  deleteVote: (voteId) =>
    set((state) => ({ votes: state.votes.filter((v) => v.id !== voteId) })),

  updateBoardStatus: (status) =>
    set((state) => {
      if (!state.board) return state;
      return { board: { ...state.board, status } };
    }),

  reset: () =>
    set({ board: null, columns: [], cards: [], votes: [], onlineUsers: [] }),
}));

// Selector helpers
export function selectCardsByColumn(state: BoardState, columnId: string) {
  return state.cards
    .filter((c) => c.column_id === columnId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function selectVoteCountForCard(state: BoardState, cardId: string) {
  return state.votes.filter((v) => v.card_id === cardId).length;
}

export function selectRemainingVotes(state: BoardState, userId: string) {
  const maxVotes =
    (state.board?.settings as Record<string, unknown>)?.max_votes ?? 5;
  const usedVotes = state.votes.filter((v) => v.user_id === userId).length;
  return (maxVotes as number) - usedVotes;
}

export function selectHasUserVotedOnCard(
  state: BoardState,
  cardId: string,
  userId: string
) {
  return state.votes.some((v) => v.card_id === cardId && v.user_id === userId);
}
