import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthListener } from '@/components/auth/auth-listener';
import { Navbar } from '@/components/layout/navbar';
import { Toaster } from '@/components/ui/sonner';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <AuthListener />
        <Navbar />
        <main>{children}</main>
        <Toaster />
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
