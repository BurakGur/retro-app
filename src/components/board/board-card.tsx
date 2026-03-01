'use client';

import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { useBoardStore } from '@/stores/board-store';
import { useDeleteCard } from '@/hooks/use-board';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VoteButton } from './vote-button';
import type { Tables } from '@/types/database';

type CardType = Tables<'cards'>;

interface BoardCardProps {
  card: CardType;
  userId: string;
}

export function BoardCard({ card, userId }: BoardCardProps) {
  const t = useTranslations('boards.card');
  const boardStatus = useBoardStore((s) => s.board?.status);
  const deleteCard = useDeleteCard();

  const isOwner = card.author_id === userId;
  const canDelete = isOwner && boardStatus === 'active';
  const showVoting = boardStatus === 'voting';

  function handleDelete() {
    if (!window.confirm(t('deleteConfirm'))) return;
    deleteCard.mutate(card.id);
  }

  return (
    <Card className="group relative">
      <CardContent className="p-3">
        <p className="whitespace-pre-wrap text-sm">{card.content}</p>

        <div className="mt-2 flex items-center justify-between">
          {showVoting && (
            <VoteButton cardId={card.id} userId={userId} />
          )}

          {!showVoting && <div />}

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleDelete}
              disabled={deleteCard.isPending}
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
