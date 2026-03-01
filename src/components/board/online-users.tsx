'use client';

import { useTranslations } from 'next-intl';
import { useBoardStore } from '@/stores/board-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function OnlineUsers() {
  const t = useTranslations('boards.header');
  const onlineUsers = useBoardStore((s) => s.onlineUsers);

  if (onlineUsers.length === 0) return null;

  const displayUsers = onlineUsers.slice(0, 5);
  const remaining = onlineUsers.length - displayUsers.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <Tooltip key={user.userId}>
            <TooltipTrigger asChild>
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs">
                  {user.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{user.displayName}</TooltipContent>
          </Tooltip>
        ))}
        {remaining > 0 && (
          <Avatar className="h-7 w-7 border-2 border-background">
            <AvatarFallback className="text-xs">+{remaining}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {t('participants', { count: onlineUsers.length })}
      </span>
    </div>
  );
}
