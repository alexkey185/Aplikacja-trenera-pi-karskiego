import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Dziękujemy za rejestrację!
              </CardTitle>
              <CardDescription>
                Sprawdź e-mail, aby potwierdzić konto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Konto zostało utworzone. Kliknij link w wiadomości e-mail, żeby
                aktywować konto i móc się zalogować.
              </p>
              <Link
                href="/auth/login"
                className="text-sm underline underline-offset-4"
              >
                Wróć do logowania
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}