'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCreateTeam } from '@/hooks/use-teams';
import {
  createTeamSchema,
  type CreateTeamFormData,
} from '@/lib/validations/team';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export function CreateTeamDialog({ children }: { children: React.ReactNode }) {
  const t = useTranslations('teams.create');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const createTeam = useCreateTeam();

  const form = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(data: CreateTeamFormData) {
    const team = await createTeam.mutateAsync(data.name);
    setOpen(false);
    form.reset();
    router.push(`/en/teams/${team.slug}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createTeam.isPending}
            >
              {createTeam.isPending ? 'Creating...' : t('submitButton')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
