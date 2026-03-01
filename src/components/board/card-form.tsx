'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAddCard } from '@/hooks/use-board';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface CardFormProps {
  boardId: string;
  columnId: string;
}

export function CardForm({ boardId, columnId }: CardFormProps) {
  const t = useTranslations('boards.card');
  const [content, setContent] = useState('');
  const addCard = useAddCard();

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setContent('');
    await addCard.mutateAsync({ boardId, columnId, content: trimmed });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('placeholder')}
        className="min-h-[60px] resize-none text-sm"
        rows={2}
      />
      <Button
        onClick={handleSubmit}
        disabled={!content.trim() || addCard.isPending}
        size="sm"
        className="self-end"
      >
        {t('addCard')}
      </Button>
    </div>
  );
}
