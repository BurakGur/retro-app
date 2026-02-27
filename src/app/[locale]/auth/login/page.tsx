import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const t = useTranslations('auth.login');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            {t('noAccount')}{' '}
            <Link
              href="/en/auth/register"
              className="text-primary hover:underline"
            >
              {t('signUpLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
