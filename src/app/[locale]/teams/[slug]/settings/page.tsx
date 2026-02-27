'use client';

import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTeam, useUpdateTeam, useDeleteTeam } from '@/hooks/use-teams';
import {
  updateTeamSchema,
  type UpdateTeamFormData,
} from '@/lib/validations/team';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

export default function TeamSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('teams.settings');
  const router = useRouter();
  const { data: team, isLoading } = useTeam(slug);
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const form = useForm<UpdateTeamFormData>({
    resolver: zodResolver(updateTeamSchema),
    values: { name: team?.name ?? '' },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Team not found</p>
      </div>
    );
  }

  async function onSubmit(data: UpdateTeamFormData) {
    await updateTeam.mutateAsync({ id: team!.id, name: data.name });
  }

  async function handleDelete() {
    if (!confirm(t('deleteTeamConfirm'))) return;
    await deleteTeam.mutateAsync(team!.id);
    router.push('/en/dashboard');
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('nameLabel')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateTeam.isPending}>
                {updateTeam.isPending ? 'Saving...' : t('saveButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('dangerZone')}</CardTitle>
          <CardDescription>{t('deleteTeamDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTeam.isPending}
          >
            {deleteTeam.isPending ? 'Deleting...' : t('deleteTeam')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
