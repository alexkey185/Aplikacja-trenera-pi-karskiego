import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireRole(allowedRoles: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // W tej wersji zakładamy, że użytkownik jest adminem swojej drużyny.
  const rola = 'admin';

  if (!allowedRoles.includes(rola)) {
    redirect('/dashboard');
  }

  return { user, rola };
}