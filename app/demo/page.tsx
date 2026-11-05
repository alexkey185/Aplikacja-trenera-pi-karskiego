import { loginAsDemo } from './actions';
import { Loader2 } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a] text-white">
      <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
      <h1 className="text-xl font-bold">Przygotowujemy Twoje demo...</h1>
      <p className="text-white/50 text-sm mt-2">Za chwilę przeniesiemy Cię do aplikacji.</p>
      
      {/* Ukryty formularz, który uruchomi Server Action po załadowaniu strony */}
      <form action={loginAsDemo} className="hidden">
        <button type="submit" id="demo-btn">Zaloguj</button>
      </form>
      <script dangerouslySetInnerHTML={{ __html: `document.getElementById('demo-btn').click();` }} />
    </div>
  );
}