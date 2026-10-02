import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/forgot-password-form';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <>
      <Link
        href="/auth/login"
        className="fixed top-6 left-6 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Powrót do logowania"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <ForgotPasswordForm />
    </>
  );
}