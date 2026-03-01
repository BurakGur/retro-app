'use client';

import { useMemo } from 'react';
import { useBoardStore } from '@/stores/board-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BoardCard } from './board-card';
import { CardForm } from './card-form';
import type { Tables } from '@/types/database';

type Column = Tables<'columns'>;

interface BoardColumnProps {
  column: Column;
  boardId: string;
  userId: string;
}

export function BoardColumn({ column, boardId, userId }: BoardColumnProps) {
  const allCards = useBoardStore((s) => s.cards);
  const boardStatus = useBoardStore((s) => s.board?.status);

  const cards = useMemo(
    () =>
      allCards
        .filter((c) => c.column_id === column.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allCards, column.id]
  );

  return (
    <div className="flex w-[300px] shrink-0 flex-col rounded-lg border bg-muted/30">
      {/* Column header with colored top border */}
      <div
        className="rounded-t-lg border-b px-4 py-3"
        style={{ borderTopColor: column.color ?? '#6b7280', borderTopWidth: 3 }}
      >
        <h3 className="font-semibold">{column.title}</h3>
      </div>

      {/* Cards list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-2">
          {cards.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              userId={userId}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Card form - only visible during active phase */}
      {boardStatus === 'active' && (
        <div className="border-t p-2">
          <CardForm boardId={boardId} columnId={column.id} />
        </div>
      )}
    </div>
  );
}
