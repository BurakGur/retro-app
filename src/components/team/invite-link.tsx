'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function InviteLink({ inviteCode }: { inviteCode: string }) {
  const t = useTranslations('teams.members');
  const tActions = useTranslations('actions');
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/en/join/${inviteCode}`
      : '';

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t('inviteLink')}</p>
      <p className="text-muted-foreground text-sm">
        {t('inviteLinkDescription')}
      </p>
      <div className="flex gap-2">
        <Input value={inviteUrl} readOnly className="font-mono text-sm" />
        <Button variant="outline" onClick={handleCopy}>
          {copied ? tActions('copied') : tActions('copy')}
        </Button>
      </div>
    </div>
  );
}
