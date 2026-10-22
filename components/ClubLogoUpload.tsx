'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadLogo } from '@/app/(app)/profil/logo-actions';
import { toast } from 'sonner';

export function ClubLogoUpload({ currentLogo }: { currentLogo: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('logo', file);

    setIsPending(true);
    const result = await uploadLogo(formData);
    setIsPending(false);

    if (result.error) {
      toast.error('Błąd wgrywania', { description: result.error });
      setPreview(currentLogo);
    } else {
      toast.success('Logo zostało zapisane');
      setPreview(result.url ?? null);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden shrink-0">
        {preview ? (
          <img src={preview} alt="Logo klubu" className="w-full h-full object-contain p-1" />
        ) : (
          <ImageIcon className="w-8 h-8 text-white/30" />
        )}
        {isPending && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isPending}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          {preview ? 'Zmień logo' : 'Wgraj logo'}
        </button>
        <p className="text-[10px] text-white/40 mt-2">
          PNG, JPG lub WEBP. Maks. 2 MB.
        </p>
      </div>
    </div>
  );
}