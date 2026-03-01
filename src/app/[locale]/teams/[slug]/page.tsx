'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useTeam } from '@/hooks/use-teams';
import { useTeamBoards } from '@/hooks/use-board';
import { CreateBoardDialog } from '@/components/board/create-board-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { use } from 'react';

const statusVariantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  voting: 'default',
  discussing: 'default',
  completed: 'secondary',
  draft: 'outline',
};

export default function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('boards');
  const { data: team } = useTeam(slug);
  const { data: boards, isLoading } = useTeamBoards(team?.id ?? '');

  if (!team) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('boardList.title')}</h2>
        <CreateBoardDialog teamId={team.id}>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            {t('boardList.newBoard')}
          </Button>
        </CreateBoardDialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : boards && boards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const cardCount =
              (board.cards as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <Link key={board.id} href={`/en/boards/${board.id}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{board.title}</CardTitle>
                      <Badge
                        variant={statusVariantMap[board.status] ?? 'outline'}
                      >
                        {t(`status.${board.status}`)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t('boardList.cardsCount', { count: cardCount })}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t('boardList.empty')}</p>
        </div>
      )}
    </div>
  );
}
