import Image from 'next/image';
import { SignUpForm } from '@/components/sign-up-form';

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Tło */}
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.webp"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src="/talent-bg.webp"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-20 min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
}