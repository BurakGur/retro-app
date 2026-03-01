'use client';

import { useTranslations } from 'next-intl';
import { useBoardStore } from '@/stores/board-store';
import { useUpdateBoardStatus } from '@/hooks/use-board';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database';

type BoardStatus = Database['public']['Enums']['board_status'];

const phaseOrder: BoardStatus[] = [
  'active',
  'voting',
  'discussing',
  'completed',
];

function getNextPhase(current: BoardStatus): BoardStatus | null {
  const idx = phaseOrder.indexOf(current);
  if (idx === -1 || idx >= phaseOrder.length - 1) return null;
  return phaseOrder[idx + 1];
}

export function PhaseControl() {
  const t = useTranslations('boards.phase');
  const st = useTranslations('boards.status');
  const board = useBoardStore((s) => s.board);
  const updateStatus = useUpdateBoardStatus();

  if (!board) return null;

  const nextPhase = getNextPhase(board.status);
  if (!nextPhase) return null;

  const isCompleting = nextPhase === 'completed';

  function handleNextPhase() {
    if (!board || !nextPhase) return;

    const message = isCompleting
      ? t('confirmComplete')
      : t('confirmNext', { phase: st(nextPhase) });

    if (!window.confirm(message)) return;

    updateStatus.mutate({ boardId: board.id, status: nextPhase });
  }

  return (
    <Button
      onClick={handleNextPhase}
      disabled={updateStatus.isPending}
      variant={isCompleting ? 'destructive' : 'default'}
      size="sm"
    >
      {isCompleting ? t('completeBoard') : t('nextPhase')}
    </Button>
  );
}
