import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ─── Wczytaj .env.local ───
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = 'test@test.pl';
const TEST_PASSWORD = 'Testowe123!';
const TEST_DRUZYNA = 'Drużyna Testowa';

async function main() {
  console.log(`🔍 Sprawdzam czy user ${TEST_EMAIL} istnieje...`);

  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('❌ Błąd listowania userów:', listErr.message);
    process.exit(1);
  }

  let userId;
  const existing = listData.users.find((u) => u.email === TEST_EMAIL);

  if (existing) {
    console.log('✅ Konto już istnieje. ID:', existing.id);
    userId = existing.id;

    if (!existing.email_confirmed_at) {
      console.log('📧 Potwierdzam email...');
      await supabase.auth.admin.updateUserById(existing.id, { email_confirm: true });
    }

    console.log('🔑 Resetuję hasło...');
    const { error: passErr } = await supabase.auth.admin.updateUserById(
      existing.id,
      { password: TEST_PASSWORD }
    );
    if (passErr) console.error('❌ Błąd hasła:', passErr.message);
  } else {
    console.log('📝 Tworzę konto...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { imie: 'Test', nazwisko: 'Trener' },
    });

    if (error) {
      console.error('❌ Błąd tworzenia usera:', error.message);
      process.exit(1);
    }
    console.log('✅ Konto utworzone. ID:', data.user.id);
    userId = data.user.id;
  }

  // ═══════════════════════════════════════════════════
  // Sprawdź / utwórz drużynę dla tego usera
  // ═══════════════════════════════════════════════════
  console.log('\n🔍 Sprawdzam czy user ma drużynę...');

  const { data: druzyny } = await supabase
    .from('druzyny')
    .select('id, nazwa')
    .eq('user_id', userId);

  if (druzyny && druzyny.length > 0) {
    console.log(`✅ Drużyna już istnieje: ${druzyny[0].nazwa} (ID: ${druzyny[0].id})`);
  } else {
    console.log('📝 Tworzę drużynę testową...');
    const { data: nowa, error } = await supabase
      .from('druzyny')
      .insert({
        user_id: userId,
        nazwa: TEST_DRUZYNA,
        rocznik: 2015,
        kolor: 'green',
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Błąd tworzenia drużyny:', error.message);
      process.exit(1);
    }
    console.log('✅ Drużyna utworzona. ID:', nowa.id);
  }

  console.log('\n🎉 Gotowe!');
  console.log(`   Email:  ${TEST_EMAIL}`);
  console.log(`   Hasło:  ${TEST_PASSWORD}`);
  console.log(`   Drużyna: ${TEST_DRUZYNA}`);
}

main().catch((err) => {
  console.error('❌ Nieoczekiwany błąd:', err);
  process.exit(1);
});