import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { locales } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : 'en';

  return {
    locale,
    messages: {
      ...(await import(`../../../messages/${locale}/common.json`)).default,
      ...(await import(`../../../messages/${locale}/auth.json`)).default,
      ...(await import(`../../../messages/${locale}/dashboard.json`)).default,
      ...(await import(`../../../messages/${locale}/teams.json`)).default,
      ...(await import(`../../../messages/${locale}/boards.json`)).default,
    },
  };
});
