'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAsDemo() {
  const supabase = await createClient();

  // ZMIEŃ NA SWOJE DANE KONTA TESTOWEGO
  const { error } = await supabase.auth.signInWithPassword({
    email: 'test@test.pl',
    password: 'Testowe123!', 
  });

  if (error) {
    console.error('Błąd logowania demo:', error);
    redirect('/auth/login?error=Nie_udalo_sie_zalogowac_do_demo');
  }

  redirect('/dashboard');
}