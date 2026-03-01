'use client';

import { useTranslations } from 'next-intl';
import { useBoardStore } from '@/stores/board-store';
import { Badge } from '@/components/ui/badge';
import { PhaseControl } from './phase-control';
import { OnlineUsers } from './online-users';

interface BoardHeaderProps {
  facilitatorName: string | null;
  isFacilitator: boolean;
}

const statusColorMap: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  voting: 'bg-blue-100 text-blue-800',
  discussing: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
};

export function BoardHeader({
  facilitatorName,
  isFacilitator,
}: BoardHeaderProps) {
  const t = useTranslations('boards');
  const board = useBoardStore((s) => s.board);

  if (!board) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{board.title}</h1>
          <Badge
            variant="secondary"
            className={statusColorMap[board.status] ?? ''}
          >
            {t(`status.${board.status}`)}
          </Badge>
        </div>
        {facilitatorName && (
          <p className="text-sm text-muted-foreground">
            {t('header.createdBy', { name: facilitatorName })}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <OnlineUsers />
        {isFacilitator && board.status !== 'completed' && <PhaseControl />}
      </div>
    </div>
  );
}
