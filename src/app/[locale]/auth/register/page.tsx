import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RegisterPage() {
  const t = useTranslations('auth.register');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            {t('hasAccount')}{' '}
            <Link
              href="/en/auth/login"
              className="text-primary hover:underline"
            >
              {t('signInLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
