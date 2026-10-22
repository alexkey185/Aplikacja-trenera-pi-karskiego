$content = @'
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import { ImportForm } from './ImportForm';

export default function ImportZawodnikow() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-3 animate-fadeIn">
        <Link
          href="/kadra"
          className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <Upload className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">
              Import zawodników
            </h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
              Wklej dane z arkusza kalkulacyjnego
            </p>
          </div>
        </div>
      </header>

      <ImportForm />
    </div>
  );
}
'@

$path = Join-Path (Get-Location) "app\(app)\zawodnicy\import\page.tsx"
[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Zapisano: $path"