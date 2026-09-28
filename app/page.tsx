import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { LogIn, ArrowRight } from 'lucide-react';

const TALENT_LOGO =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2OTYgMjUwIiB3aWR0aD0iNjk2IiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIj48dGl0bGU+dGFsZW50LjwvdGl0bGU+PHBhdGggZD0iTTY2LjQgMTAyLjE5OTk5OTk5OTk5OTk5VjE1NS44UTY2LjQgMTYxLjQgNjkuMTAwMDAwMDAwMDAwMDEgMTYzLjlRNzEuODAwMDAwMDAwMDAwMDEgMTY2LjQgNzguMiAxNjYuNEg5MS4yVjE5MC4wSDczLjZRMzguMiAxOTAuMCAzOC4yIDE1NS42VjEwMi4xOTk5OTk5OTk5OTk5OUgyNS4wVjc5LjE5OTk5OTk5OTk5OTk5SDM4LjJWNTEuNzk5OTk5OTk5OTk5OThINjYuNFY3OS4xOTk5OTk5OTk5OTk5OUg5MS4yVjEwMi4xOTk5OTk5OTk5OTk5OVogTTE1NC44IDc3LjM5OTk5OTk5OTk5OTk5UTE2Ny4yMDAwMDAwMDAwMDAwMiA3Ny4zOTk5OTk5OTk5OTk5OSAxNzYuNSA4Mi4zOTk5OTk5OTk5OTk5OVExODUuOCA4Ny4zOTk5OTk5OTk5OTk5OSAxOTEuNDAwMDAwMDAwMDAwMDMgOTUuMFY3OS4xOTk5OTk5OTk5OTk5OUgyMTkuNjAwMDAwMDAwMDAwMDJWMTkwLjBIMTkxLjQwMDAwMDAwMDAwMDAzVjE3My44UTE4Ni4wIDE4MS42IDE3Ni41IDE4Ni43UTE2Ny4wIDE5MS44IDE1NC42MDAwMDAwMDAwMDAwMiAxOTEuOFExNDAuNjAwMDAwMDAwMDAwMDIgMTkxLjggMTI5LjEwMDAwMDAwMDAwMDAyIDE4NC42MDAwMDAwMDAwMDAwMlExMTcuNjAwMDAwMDAwMDAwMDEgMTc3LjQgMTEwLjkgMTY0LjNRMTA0LjIgMTUxLjIgMTA0LjIgMTM0LjJRMTA0LjIgMTE3LjM5OTk5OTk5OTk5OTk5IDExMC45IDEwNC4zOTk5OTk5OTk5OTk5OVExMTcuNjAwMDAwMDAwMDAwMDEgOTEuMzk5OTk5OTk5OTk5OTkgMTI5LjEwMDAwMDAwMDAwMDAyIDg0LjM5OTk5OTk5OTk5OTk5UTE0MC42MDAwMDAwMDAwMDAwMiA3Ny4zOTk5OTk5OTk5OTk5OSAxNTQuOCA3Ny4zOTk5OTk5OTk5OTk5OVpNMTYyLjAgMTAyLjBRMTU0LjIwMDAwMDAwMDAwMDAyIDEwMi4wIDE0Ny42MDAwMDAwMDAwMDAwMiAxMDUuOFExNDEuMCAxMDkuNiAxMzYuOSAxMTYuOVExMzIuOCAxMjQuMiAxMzIuOCAxMzQuMlExMzIuOCAxNDQuMiAxMzYuOSAxNTEuN1ExNDEuMCAxNTkuMiAxNDcuNyAxNjMuMlExNTQuNCAxNjcuMiAxNjIuMCAxNjcuMlExNjkuOCAxNjcuMiAxNzYuNjAwMDAwMDAwMDAwMDIgMTYzLjNRMTgzLjQwMDAwMDAwMDAwMDAzIDE1OS40IDE4Ny40MDAwMDAwMDAwMDAwMyAxNTIuMTAwMDAwMDAwMDAwMDJRMTkxLjQwMDAwMDAwMDAwMDAzIDE0NC44IDE5MS40MDAwMDAwMDAwMDAwMyAxMzQuNlExOTEuNDAwMDAwMDAwMDAwMDMgMTI0LjM5OTk5OTk5OTk5OTk5IDE4Ny40MDAwMDAwMDAwMDAwMyAxMTcuMVExODMuNDAwMDAwMDAwMDAwMDMgMTA5LjggMTc2LjYwMDAwMDAwMDAwMDAyIDEwNS45UTE2OS44IDEwMi4wIDE2Mi4wIDEwMi4wWiBNMjc1LjAgNDIuMFYxOTAuMEgyNDcuMFY0Mi4wWiBNNDA0LjggMTQzLjBIMzIzLjhRMzI0LjggMTU1LjAgMzMyLjIwMDAwMDAwMDAwMDA1IDE2MS44UTMzOS42IDE2OC42IDM1MC40MDAwMDAwMDAwMDAwMyAxNjguNlEzNjYuMCAxNjguNiAzNzIuNiAxNTUuMkg0MDIuOFEzOTguMCAxNzEuMiAzODQuNCAxODEuNVEzNzAuOCAxOTEuOCAzNTEuMCAxOTEuOFEzMzUuMCAxOTEuOCAzMjIuMyAxODQuN1EzMDkuNiAxNzcuNiAzMDIuNSAxNjQuNlEyOTUuNDAwMDAwMDAwMDAwMDMgMTUxLjYgMjk1LjQwMDAwMDAwMDAwMDAzIDEzNC42UTI5NS40MDAwMDAwMDAwMDAwMyAxMTcuMzk5OTk5OTk5OTk5OTkgMzAyLjQwMDAwMDAwMDAwMDAzIDEwNC4zOTk5OTk5OTk5OTk5OVEzMDkuNDAwMDAwMDAwMDAwMDMgOTEuMzk5OTk5OTk5OTk5OTkgMzIyLjAgODQuMzk5OTk5OTk5OTk5OTlRMzM0LjYgNzcuMzk5OTk5OTk5OTk5OTkgMzUxLjAgNzcuMzk5OTk5OTk5OTk5OTlRMzY2LjggNzcuMzk5OTk5OTk5OTk5OTkgMzc5LjMgODQuMTk5OTk5OTk5OTk5OTlRMzkxLjggOTEuMCAzOTguNzAwMDAwMDAwMDAwMDUgMTAzLjVRNDA1LjYgMTE2LjAgNDA1LjYgMTMyLjJRNDA1LjYgMTM4LjIgNDA0LjggMTQzLjBaTTM3Ni42IDEyNC4yUTM3Ni40MDAwMDAwMDAwMDAwMyAxMTMuMzk5OTk5OTk5OTk5OTkgMzY4LjgwMDAwMDAwMDAwMDA3IDEwNi44OTk5OTk5OTk5OTk5OVEzNjEuMjAwMDAwMDAwMDAwMDUgMTAwLjM5OTk5OTk5OTk5OTk5IDM1MC4yMDAwMDAwMDAwMDAwNSAxMDAuMzk5OTk5OTk5OTk5OTlRMzM5LjggMTAwLjM5OTk5OTk5OTk5OTk5IDMzMi43MDAwMDAwMDAwMDAwNSAxMDYuNjk5OTk5OTk5OTk5OTlRMzI1LjYgMTEzLjAgMzI0LjAgMTI0LjJaIE01MzEuNiAxMjUuMFYxOTAuMEg1MDMuNlYxMjguOFE1MDMuNiAxMTUuNiA0OTcuMCAxMDguNVE0OTAuNDAwMDAwMDAwMDAwMDMgMTAxLjM5OTk5OTk5OTk5OTk5IDQ3OS4wMDAwMDAwMDAwMDAwNiAxMDEuMzk5OTk5OTk5OTk5OTlRNDY3LjQwMDAwMDAwMDAwMDAzIDEwMS4zOTk5OTk5OTk5OTk5OSA0NjAuNzAwMDAwMDAwMDAwMDUgMTA4LjVRNDU0LjAwMDAwMDAwMDAwMDA2IDExNS42IDQ1NC4wMDAwMDAwMDAwMDAwNiAxMjguOFYxOTAuMEg0MjYuMDAwMDAwMDAwMDAwMDZWNzkuMTk5OTk5OTk5OTk5OTlINDU0LjAwMDAwMDAwMDAwMDA2VjkzLjBRNDU5LjYgODUuOCA0NjguMzAwMDAwMDAwMDAwMDcgODEuNjk5OTk5OTk5OTk5OTlRNDc3LjAwMDAwMDAwMDAwMDA2IDc3LjYgNDg3LjQwMDAwMDAwMDAwMDAzIDc3LjZRNTA3LjIwMDAwMDAwMDAwMDA1IDc3LjYgNTE5LjQwMDAwMDAwMDAwMDEgOTAuMVE1MzEuNiAxMDIuNiA1MzEuNiAxMjUuMFogTTU5MC44MDAwMDAwMDAwMDAxIDEwMi4xOTk5OTk5OTk5OTk5OVYxNTUuOFE1OTAuODAwMDAwMDAwMDAwMSAxNjEuNCA1OTMuNSAxNjMuOVE1OTYuMiAxNjYuNCA2MDIuNjAwMDAwMDAwMDAwMSAxNjYuNEg2MTUuNjAwMDAwMDAwMDAwMVYxOTAuMEg1OTguMDAwMDAwMDAwMDAwMVE1NjIuNjAwMDAwMDAwMDAwMSAxOTAuMCA1NjIuNjAwMDAwMDAwMDAwMSAxNTUuNlYxMDIuMTk5OTk5OTk5OTk5OTlINTQ5LjQwMDAwMDAwMDAwMDFWNzkuMTk5OTk5OTk5OTk5OTlINTYyLjYwMDAwMDAwMDAwMDFWNTEuNzk5OTk5OTk5OTk5OThINTkwLjgwMDAwMDAwMDAwMDFWNzkuMTk5OTk5OTk5OTk5OTlINjE1LjYwMDAwMDAwMDAwMDFWMTAyLjE5OTk5OTk5OTk5OTk5WiIgZmlsbD0iI2YxZjVmOSIvPjxjaXJjbGUgY3g9IjY1My4wIiBjeT0iMTY3LjAiIHI9IjIzLjAiIGZpbGw9IiM0YWRlODAiLz48L3N2Zz4=';

export default async function StartScreen() {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const zalogowany = !!user;
  const href = zalogowany ? '/dashboard' : '/auth/login';

  return (
    <main
      style={{
        background:
          'radial-gradient(ellipse 55% 40% at 50% 44%, rgba(34,197,94,.07) 0%, rgba(34,197,94,0) 100%), radial-gradient(ellipse 75% 60% at 50% 44%, #0f172a 0%, #0a0e1a 75%)',
        backgroundColor: '#0a0e1a',
        backgroundAttachment: 'fixed',
      }}
      className="min-h-screen text-slate-400"
    >
      <div className="min-h-screen flex flex-col items-center justify-center gap-7 p-6 text-center relative">
        {/* Logo — SVG base64 */}
        <img
          src={TALENT_LOGO}
          alt="talent."
          className="w-[min(78vw,300px)] h-auto block"
        />

        {/* Tagline */}
        <div className="flex flex-col gap-2 items-center">
          <h1 className="m-0 text-[22px] font-semibold text-slate-100 leading-tight max-w-[320px]">
            Twoja drużyna, Twoje zasady.
          </h1>
          <p className="m-0 text-[15px] max-w-[300px] leading-relaxed">
            Obecność i plan treningów w jednym miejscu.
          </p>
        </div>

        {/* Przycisk */}
        <Link
          href={href}
          className="group flex items-center justify-center gap-3 w-[min(100%,320px)] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold text-base transition-all shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
        >
          {zalogowany ? (
            <>
              Wejdź do aplikacji
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Zaloguj się
            </>
          )}
        </Link>

        {/* Footer */}
        <footer className="absolute bottom-[calc(20px+env(safe-area-inset-bottom,0px))] left-0 right-0 text-xs">
          <Link
            href="#"
            className="text-slate-600 hover:text-slate-400 transition-colors mx-2"
          >
            Polityka prywatności
          </Link>
          <Link
            href="#"
            className="text-slate-600 hover:text-slate-400 transition-colors mx-2"
          >
            Regulamin
          </Link>
        </footer>
      </div>
    </main>
  );
}