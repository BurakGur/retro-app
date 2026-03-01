'use client';

import { useTranslations } from 'next-intl';
import { ThumbsUp } from 'lucide-react';
import {
  useBoardStore,
  selectVoteCountForCard,
  selectHasUserVotedOnCard,
  selectRemainingVotes,
} from '@/stores/board-store';
import { useAddVote, useRemoveVote } from '@/hooks/use-board';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoteButtonProps {
  cardId: string;
  userId: string;
}

export function VoteButton({ cardId, userId }: VoteButtonProps) {
  const t = useTranslations('boards.voting');
  const voteCount = useBoardStore((s) => selectVoteCountForCard(s, cardId));
  const hasVoted = useBoardStore((s) =>
    selectHasUserVotedOnCard(s, cardId, userId)
  );
  const remaining = useBoardStore((s) => selectRemainingVotes(s, userId));
  const boardId = useBoardStore((s) => s.board?.id);

  const addVote = useAddVote();
  const removeVote = useRemoveVote();

  const canVote = !hasVoted && remaining > 0;

  function handleClick() {
    if (hasVoted) {
      removeVote.mutate(cardId);
    } else if (canVote && boardId) {
      addVote.mutate({ boardId, cardId });
    }
  }

  const tooltipText = hasVoted
    ? t('unvote')
    : remaining > 0
      ? t('votesRemaining', { count: remaining })
      : t('noVotesLeft');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={hasVoted ? 'default' : 'outline'}
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={handleClick}
          disabled={
            (!hasVoted && !canVote) ||
            addVote.isPending ||
            removeVote.isPending
          }
        >
          <ThumbsUp className="h-3 w-3" />
          {voteCount > 0 && <span>{voteCount}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
