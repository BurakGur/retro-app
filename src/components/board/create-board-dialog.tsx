'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCreateBoard } from '@/hooks/use-board';
import {
  createBoardSchema,
  type CreateBoardFormData,
} from '@/lib/validations/board';
import { boardTemplates } from '@/lib/board-templates';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateBoardDialogProps {
  teamId: string;
  children: React.ReactNode;
}

export function CreateBoardDialog({ teamId, children }: CreateBoardDialogProps) {
  const t = useTranslations('boards.create');
  const tt = useTranslations('boards.templates');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const createBoard = useCreateBoard();

  const form = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      title: '',
      template: 'mad_sad_glad',
      maxVotes: 5,
    },
  });

  const selectedTemplate = form.watch('template');

  async function onSubmit(data: CreateBoardFormData) {
    const boardId = await createBoard.mutateAsync({
      title: data.title,
      teamId,
      template: data.template,
      maxVotes: data.maxVotes,
      customColumns: data.customColumns,
    });
    setOpen(false);
    form.reset();
    router.push(`/en/boards/${boardId}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('titleLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('titlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('templateLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('templatePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {boardTemplates.map((tmpl) => (
                        <SelectItem key={tmpl.id} value={tmpl.id}>
                          {tt(tmpl.labelKey.replace('boards.templates.', ''))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template preview */}
            {selectedTemplate !== 'custom' && (
              <div className="flex gap-2">
                {boardTemplates
                  .find((t) => t.id === selectedTemplate)
                  ?.columns.map((col) => (
                    <div
                      key={col.title}
                      className="flex-1 rounded-md border p-2 text-center text-xs"
                      style={{ borderTopColor: col.color, borderTopWidth: 3 }}
                    >
                      {col.title}
                    </div>
                  ))}
              </div>
            )}

            <FormField
              control={form.control}
              name="maxVotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('maxVotesLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createBoard.isPending}
            >
              {createBoard.isPending ? t('creating') : t('submitButton')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
