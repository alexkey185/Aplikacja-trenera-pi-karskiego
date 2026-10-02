  const { data: rawTreningi, error: errT } = await supabase
    .from('treningi')
    .select('*, obecnosc (trening_id, status)')
    .eq('data', data)
    .eq('druzyna_id', druzynaId)
    .order('godzina', { ascending: true });

  if (errT) {
    console.error('Błąd pobierania treningów:', errT);
  }

  // ═══════════════════════════════════════════════════════
  // PostgREST zwraca treningi z zagnieżdżoną tablicą `obecnosc`.
  // Wyciągamy ją osobno (dla stats), a `treningi` zostawiamy
  // z nadmiarowym polem `obecnosc` — dalej w kodzie i tak
  // używamy tylko konkretnych kolumn.
  // ═══════════════════════════════════════════════════════
  const treningi = rawTreningi ?? [];
  const obecnosci = treningi.flatMap((t: any) => t.obecnosc ?? []);

  const stats = new Map<number, { obecni: number; total: number }>();
  obecnosci.forEach((o: { trening_id: number; status: string }) => {
    const s = stats.get(o.trening_id) ?? { obecni: 0, total: 0 };
    s.total += 1;
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    stats.set(o.trening_id, s);
  });