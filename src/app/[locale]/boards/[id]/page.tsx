'use client';

import { use, useEffect } from 'react';
import { useBoard, useBoardRealtime } from '@/hooks/use-board';
import { useBoardStore } from '@/stores/board-store';
import { useAuthStore } from '@/stores/auth-store';
import { BoardHeader } from '@/components/board/board-header';
import { BoardColumn } from '@/components/board/board-column';
import { Skeleton } from '@/components/ui/skeleton';

export default function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: boardId } = use(params);
  const { isLoading, error } = useBoard(boardId);
  const { user, profile } = useAuthStore();
  const board = useBoardStore((s) => s.board);
  const columns = useBoardStore((s) => s.columns);
  const reset = useBoardStore((s) => s.reset);

  // Subscribe to realtime
  useBoardRealtime(boardId);

  // Cleanup on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 w-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const isFacilitator = board.facilitator_id === user?.id;
  const facilitatorName = isFacilitator
    ? profile?.display_name ?? null
    : null;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <BoardHeader
        facilitatorName={facilitatorName}
        isFacilitator={isFacilitator}
      />

      {/* Horizontal column grid */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            boardId={board.id}
            userId={user?.id ?? ''}
          />
        ))}
      </div>
    </div>
  );
}
