'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useJoinTeam } from '@/hooks/use-teams';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function JoinTeamPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const t = useTranslations('teams.join');
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const joinTeam = useJoinTeam();
  const [status, setStatus] = useState<
    'idle' | 'joining' | 'joined' | 'already' | 'error'
  >('idle');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/en/auth/login?redirect=/en/join/${code}`);
    }
  }, [authLoading, user, router, code]);

  async function handleJoin() {
    setStatus('joining');
    try {
      const result = await joinTeam.mutateAsync(code);
      if (result.alreadyMember) {
        setStatus('already');
        setTimeout(() => router.push(`/en/teams/${result.team.slug}`), 1500);
      } else {
        setStatus('joined');
        setTimeout(() => router.push(`/en/teams/${result.team.slug}`), 1500);
      }
    } catch {
      setStatus('error');
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {status === 'already'
              ? t('alreadyMember')
              : status === 'error'
                ? t('invalidCode')
                : status === 'joined'
                  ? 'Redirecting...'
                  : t('description', { teamName: 'this team' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'idle' && (
            <Button onClick={handleJoin}>{t('joinButton')}</Button>
          )}
          {status === 'joining' && (
            <Button disabled>Joining...</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
