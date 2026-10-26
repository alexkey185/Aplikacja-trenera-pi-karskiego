--
-- PostgreSQL database dump
--

\restrict H0AmtLT8ziPMAQL0s1AVP4ehPSyMqb6O9cTAYmgE2HjggvNM3ims7VSZwxacTSk

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: check_rate_limit(text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_max integer, p_window_seconds integer) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_count int;
  v_window_start timestamptz;
  v_elapsed numeric;
begin
  -- Sprawdź obecny stan
  select count, window_start into v_count, v_window_start
  from rate_limits
  where identifier = p_identifier and action = p_action;

  v_elapsed := extract(epoch from (now() - coalesce(v_window_start, now())));

  -- Nowe okno (brak wpisu lub okno wygasło)
  if v_count is null or v_elapsed >= p_window_seconds then
    insert into rate_limits (identifier, action, count, window_start)
    values (p_identifier, p_action, 1, now())
    on conflict (identifier, action) do update
    set count = 1, window_start = now();
    v_count := 1;
    v_window_start := now();
  else
    update rate_limits
    set count = count + 1
    where identifier = p_identifier and action = p_action
    returning count into v_count;
  end if;

  -- Sprawdź czy przekroczono
  if v_count > p_max then
    return jsonb_build_object(
      'allowed', false,
      'count', v_count,
      'max', p_max,
      'retry_after',
      greatest(
        1,
        ceil(p_window_seconds - extract(epoch from (now() - v_window_start)))::int
      )
    );
  end if;

  return jsonb_build_object(
    'allowed', true,
    'count', v_count,
    'max', p_max
  );
end;
$$;


--
-- Name: get_frekwencja_zawodnikow(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_frekwencja_zawodnikow(p_druzyna_id uuid) RETURNS TABLE(zawodnik_id bigint, obecni bigint, total bigint)
    LANGUAGE sql STABLE
    AS $$
  select
    z.id as zawodnik_id,
    count(o.trening_id) filter (where o.status in ('obecny', 'spozniony'))::bigint as obecni,
    count(o.trening_id)::bigint as total
  from public.zawodnicy z
  left join public.obecnosc o on o.zawodnik_id = z.id
  where z.druzyna_id = p_druzyna_id
  group by z.id;
$$;


--
-- Name: get_miesiace_druzyny(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_miesiace_druzyny(p_druzyna_id uuid) RETURNS TABLE(miesiac text)
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
  select distinct substring(t.data::text, 1, 7) as miesiac
  from public.treningi t
  where t.druzyna_id = p_druzyna_id
  order by miesiac desc;
$$;


--
-- Name: get_statystyki_druzyny(uuid, date, date, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_statystyki_druzyny(p_druzyna_id uuid, p_od date, p_do date, p_miesiace integer DEFAULT 6) RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  WITH
  t_zakres AS (
    SELECT id, data, typ
    FROM treningi
    WHERE druzyna_id = p_druzyna_id
      AND data BETWEEN p_od AND p_do
  ),
  o_zakres AS (
    SELECT o.trening_id, o.zawodnik_id, o.status
    FROM obecnosc o
    WHERE o.trening_id IN (SELECT id FROM t_zakres)
  ),
  stats AS (
    SELECT
      (SELECT COUNT(*) FROM t_zakres)::int AS total_treningi,
      (SELECT COUNT(*) FROM o_zakres)::int AS total_wpisy,
      (SELECT COUNT(*) FROM o_zakres WHERE status IN ('obecny','spozniony'))::int AS obecni_razem,
      (SELECT COUNT(DISTINCT trening_id) FROM o_zakres)::int AS treningi_z_wpisami,
      (SELECT COALESCE(jsonb_agg(
          jsonb_build_object('id', id, 'data', data, 'typ', typ)
          ORDER BY data
        ), '[]'::jsonb)
       FROM t_zakres t
       WHERE t.data < CURRENT_DATE
         AND NOT EXISTS (SELECT 1 FROM o_zakres o WHERE o.trening_id = t.id)
      ) AS treningi_bez_wpisow
  ),
  ranking AS (
    SELECT
      z.id, z.imie, z.nazwisko, z.numer,
      COUNT(*)::int AS wpisy,
      COUNT(*) FILTER (WHERE o.status IN ('obecny','spozniony'))::int AS obecnosci,
      ROUND(100.0 * COUNT(*) FILTER (WHERE o.status IN ('obecny','spozniony'))
            / NULLIF(COUNT(*), 0))::int AS procent
    FROM zawodnicy z
    INNER JOIN o_zakres o ON o.zawodnik_id = z.id
    WHERE z.druzyna_id = p_druzyna_id
    GROUP BY z.id, z.imie, z.nazwisko, z.numer
    ORDER BY obecnosci DESC, procent DESC, z.nazwisko ASC
  ),
  wszystkie_mies AS (
    SELECT generate_series(
      date_trunc('month', p_do) - ((p_miesiace - 1) || ' months')::interval,
      date_trunc('month', p_do),
      '1 month'::interval
    )::date AS miesiac
  ),
  t_mies AS (
    SELECT id, date_trunc('month', data)::date AS miesiac
    FROM treningi
    WHERE druzyna_id = p_druzyna_id
      AND data >= (SELECT MIN(miesiac) FROM wszystkie_mies)
      AND data <= p_do
  ),
  o_mies AS (
    SELECT o.status, t.miesiac
    FROM obecnosc o
    INNER JOIN t_mies t ON t.id = o.trening_id
  ),
  agregat AS (
    SELECT
      t.miesiac,
      COUNT(DISTINCT t.id)::int AS treningi,
      COUNT(o.status)::int AS wpisy,
      COUNT(o.status) FILTER (WHERE o.status IN ('obecny','spozniony'))::int AS obecni
    FROM t_mies t
    LEFT JOIN o_mies o ON o.miesiac = t.miesiac
    GROUP BY t.miesiac
  ),
  miesiace AS (
    SELECT
      to_char(wm.miesiac, 'YYYY-MM') AS iso,
      COALESCE(a.treningi, 0)::int AS treningi,
      COALESCE(a.wpisy, 0)::int AS wpisy,
      COALESCE(a.obecni, 0)::int AS obecni,
      CASE
        WHEN COALESCE(a.wpisy, 0) > 0
          THEN ROUND(100.0 * a.obecni / a.wpisy)::int
        ELSE NULL
      END AS procent
    FROM wszystkie_mies wm
    LEFT JOIN agregat a ON a.miesiac = wm.miesiac
    ORDER BY wm.miesiac
  )
  SELECT jsonb_build_object(
    'stats',    (SELECT row_to_json(stats) FROM stats),
    'ranking',  (SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb) FROM ranking r),
    'miesiace', (SELECT COALESCE(jsonb_agg(row_to_json(m)), '[]'::jsonb) FROM miesiace m)
  );
$$;


--
-- Name: get_zawodnicy_counts(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_zawodnicy_counts() RETURNS TABLE(druzyna_id uuid, cnt bigint)
    LANGUAGE sql STABLE
    AS $$
  select z.druzyna_id, count(*)::bigint
  from public.zawodnicy z
  join public.druzyny d on d.id = z.druzyna_id
  where d.user_id = auth.uid()
  group by z.druzyna_id;
$$;


--
-- Name: set_user_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_user_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: druzyny; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.druzyny (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    nazwa text NOT NULL,
    rocznik integer,
    kolor text DEFAULT 'green'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    logo_url text
);


--
-- Name: obecnosc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obecnosc (
    id bigint NOT NULL,
    trening_id bigint NOT NULL,
    zawodnik_id bigint NOT NULL,
    status text DEFAULT 'obecny'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT check_status_valid CHECK ((status = ANY (ARRAY['obecny'::text, 'nieobecny'::text, 'spozniony'::text, 'usprawiedliwiony'::text])))
);


--
-- Name: obecnosc_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.obecnosc ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.obecnosc_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    identifier text NOT NULL,
    action text NOT NULL,
    count integer DEFAULT 1 NOT NULL,
    window_start timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: treningi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.treningi (
    id bigint NOT NULL,
    data date NOT NULL,
    godzina text NOT NULL,
    miejsce text,
    typ text DEFAULT 'trening'::text NOT NULL,
    przeciwnik text,
    notatki text,
    created_at timestamp with time zone DEFAULT now(),
    cykl_id uuid,
    user_id uuid,
    druzyna_id uuid NOT NULL
);


--
-- Name: COLUMN treningi.cykl_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.treningi.cykl_id IS 'UUID grupy dla treningów cyklicznych. NULL = jednorazowy.';


--
-- Name: treningi_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.treningi ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.treningi_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_consents (
    user_id uuid NOT NULL,
    terms_version text NOT NULL,
    privacy_version text NOT NULL,
    accepted_at timestamp with time zone DEFAULT now() NOT NULL,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: zawodnicy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zawodnicy (
    id bigint NOT NULL,
    imie text NOT NULL,
    nazwisko text NOT NULL,
    rocznik integer,
    pozycja text,
    numer integer,
    kontakt_rodzica text,
    notatki text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    druzyna_id uuid NOT NULL
);


--
-- Name: zawodnicy_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.zawodnicy ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.zawodnicy_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: zgloszenia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zgloszenia (
    id bigint NOT NULL,
    user_id uuid,
    user_email text NOT NULL,
    typ text NOT NULL,
    temat text NOT NULL,
    opis text NOT NULL,
    status text DEFAULT 'nowe'::text,
    page_url text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT zgloszenia_status_check CHECK ((status = ANY (ARRAY['nowe'::text, 'w_toku'::text, 'rozwiazane'::text, 'odrzucone'::text]))),
    CONSTRAINT zgloszenia_typ_check CHECK ((typ = ANY (ARRAY['blad'::text, 'pomysl'::text, 'pytanie'::text, 'inne'::text])))
);


--
-- Name: zgloszenia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zgloszenia_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zgloszenia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zgloszenia_id_seq OWNED BY public.zgloszenia.id;


--
-- Name: zgloszenia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zgloszenia ALTER COLUMN id SET DEFAULT nextval('public.zgloszenia_id_seq'::regclass);


--
-- Name: druzyny druzyny_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.druzyny
    ADD CONSTRAINT druzyny_pkey PRIMARY KEY (id);


--
-- Name: obecnosc obecnosc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obecnosc
    ADD CONSTRAINT obecnosc_pkey PRIMARY KEY (id);


--
-- Name: obecnosc obecnosc_trening_id_zawodnik_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obecnosc
    ADD CONSTRAINT obecnosc_trening_id_zawodnik_id_key UNIQUE (trening_id, zawodnik_id);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (identifier, action);


--
-- Name: treningi treningi_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treningi
    ADD CONSTRAINT treningi_pkey1 PRIMARY KEY (id);


--
-- Name: zawodnicy unique_numer_per_druzyna; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zawodnicy
    ADD CONSTRAINT unique_numer_per_druzyna UNIQUE (druzyna_id, numer) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_consents user_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_consents
    ADD CONSTRAINT user_consents_pkey PRIMARY KEY (user_id);


--
-- Name: zawodnicy zawodnicy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zawodnicy
    ADD CONSTRAINT zawodnicy_pkey PRIMARY KEY (id);


--
-- Name: zgloszenia zgloszenia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zgloszenia
    ADD CONSTRAINT zgloszenia_pkey PRIMARY KEY (id);


--
-- Name: idx_druzyny_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_druzyny_user_id ON public.druzyny USING btree (user_id);


--
-- Name: idx_obecnosc_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obecnosc_status ON public.obecnosc USING btree (status);


--
-- Name: idx_obecnosc_trening; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obecnosc_trening ON public.obecnosc USING btree (trening_id);


--
-- Name: idx_obecnosc_trening_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obecnosc_trening_id ON public.obecnosc USING btree (trening_id);


--
-- Name: idx_obecnosc_trening_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obecnosc_trening_status ON public.obecnosc USING btree (trening_id, status);


--
-- Name: idx_obecnosc_zawodnik; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obecnosc_zawodnik ON public.obecnosc USING btree (zawodnik_id);


--
-- Name: idx_obecnosc_zawodnik_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obecnosc_zawodnik_id ON public.obecnosc USING btree (zawodnik_id);


--
-- Name: idx_rate_limits_window; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limits_window ON public.rate_limits USING btree (window_start);


--
-- Name: idx_treningi_cykl; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treningi_cykl ON public.treningi USING btree (cykl_id) WHERE (cykl_id IS NOT NULL);


--
-- Name: idx_treningi_cykl_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treningi_cykl_id ON public.treningi USING btree (cykl_id);


--
-- Name: idx_treningi_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treningi_data ON public.treningi USING btree (data);


--
-- Name: idx_treningi_druzyna_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treningi_druzyna_data ON public.treningi USING btree (druzyna_id, data DESC);


--
-- Name: idx_treningi_druzyna_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treningi_druzyna_id ON public.treningi USING btree (druzyna_id);


--
-- Name: idx_treningi_typ; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treningi_typ ON public.treningi USING btree (typ);


--
-- Name: idx_treningi_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treningi_user_id ON public.treningi USING btree (user_id);


--
-- Name: idx_user_consents_accepted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_consents_accepted_at ON public.user_consents USING btree (accepted_at);


--
-- Name: idx_zawodnicy_druzyna; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zawodnicy_druzyna ON public.zawodnicy USING btree (druzyna_id);


--
-- Name: idx_zawodnicy_druzyna_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zawodnicy_druzyna_id ON public.zawodnicy USING btree (druzyna_id);


--
-- Name: idx_zawodnicy_druzyna_nazwisko; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zawodnicy_druzyna_nazwisko ON public.zawodnicy USING btree (druzyna_id, nazwisko, imie);


--
-- Name: idx_zawodnicy_nazwisko; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zawodnicy_nazwisko ON public.zawodnicy USING btree (nazwisko);


--
-- Name: idx_zawodnicy_numer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zawodnicy_numer ON public.zawodnicy USING btree (numer);


--
-- Name: idx_zawodnicy_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zawodnicy_user_id ON public.zawodnicy USING btree (user_id);


--
-- Name: idx_zgloszenia_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zgloszenia_created_at ON public.zgloszenia USING btree (created_at DESC);


--
-- Name: idx_zgloszenia_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zgloszenia_user_id ON public.zgloszenia USING btree (user_id);


--
-- Name: treningi trigger_set_user_id_treningi; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_user_id_treningi BEFORE INSERT ON public.treningi FOR EACH ROW EXECUTE FUNCTION public.set_user_id();


--
-- Name: zawodnicy trigger_set_user_id_zawodnicy; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_user_id_zawodnicy BEFORE INSERT ON public.zawodnicy FOR EACH ROW EXECUTE FUNCTION public.set_user_id();


--
-- Name: druzyny druzyny_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.druzyny
    ADD CONSTRAINT druzyny_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: obecnosc obecnosc_trening_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obecnosc
    ADD CONSTRAINT obecnosc_trening_id_fkey FOREIGN KEY (trening_id) REFERENCES public.treningi(id) ON DELETE CASCADE;


--
-- Name: obecnosc obecnosc_zawodnik_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obecnosc
    ADD CONSTRAINT obecnosc_zawodnik_id_fkey FOREIGN KEY (zawodnik_id) REFERENCES public.zawodnicy(id) ON DELETE CASCADE;


--
-- Name: treningi treningi_druzyna_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treningi
    ADD CONSTRAINT treningi_druzyna_id_fkey FOREIGN KEY (druzyna_id) REFERENCES public.druzyny(id) ON DELETE CASCADE;


--
-- Name: treningi treningi_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treningi
    ADD CONSTRAINT treningi_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_consents user_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_consents
    ADD CONSTRAINT user_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: zawodnicy zawodnicy_druzyna_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zawodnicy
    ADD CONSTRAINT zawodnicy_druzyna_id_fkey FOREIGN KEY (druzyna_id) REFERENCES public.druzyny(id) ON DELETE CASCADE;


--
-- Name: zawodnicy zawodnicy_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zawodnicy
    ADD CONSTRAINT zawodnicy_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: zgloszenia zgloszenia_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zgloszenia
    ADD CONSTRAINT zgloszenia_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: obecnosc Trener dodaje obecności; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trener dodaje obecności" ON public.obecnosc FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.treningi t
  WHERE ((t.id = obecnosc.trening_id) AND (t.user_id = auth.uid())))));


--
-- Name: obecnosc Trener edytuje obecności swoich treningów; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trener edytuje obecności swoich treningów" ON public.obecnosc FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.treningi t
  WHERE ((t.id = obecnosc.trening_id) AND (t.user_id = auth.uid())))));


--
-- Name: obecnosc Trener usuwa obecności swoich treningów; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trener usuwa obecności swoich treningów" ON public.obecnosc FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.treningi t
  WHERE ((t.id = obecnosc.trening_id) AND (t.user_id = auth.uid())))));


--
-- Name: obecnosc Trener widzi obecności swoich treningów; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trener widzi obecności swoich treningów" ON public.obecnosc FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.treningi t
  WHERE ((t.id = obecnosc.trening_id) AND (t.user_id = auth.uid())))));


--
-- Name: zgloszenia User dodaje zgloszenia; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User dodaje zgloszenia" ON public.zgloszenia FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: zgloszenia User widzi swoje zgloszenia; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User widzi swoje zgloszenia" ON public.zgloszenia FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_consents consents_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY consents_insert_own ON public.user_consents FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: user_consents consents_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY consents_select_own ON public.user_consents FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: druzyny; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.druzyny ENABLE ROW LEVEL SECURITY;

--
-- Name: druzyny druzyny_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY druzyny_delete_own ON public.druzyny FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: druzyny druzyny_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY druzyny_insert_own ON public.druzyny FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: druzyny druzyny_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY druzyny_select_own ON public.druzyny FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: druzyny druzyny_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY druzyny_update_own ON public.druzyny FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: obecnosc; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.obecnosc ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: treningi trener_delete_treningi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trener_delete_treningi ON public.treningi FOR DELETE USING ((druzyna_id IN ( SELECT druzyny.id
   FROM public.druzyny
  WHERE (druzyny.user_id = auth.uid()))));


--
-- Name: zawodnicy trener_delete_zawodnicy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trener_delete_zawodnicy ON public.zawodnicy FOR DELETE USING ((druzyna_id IN ( SELECT druzyny.id
   FROM public.druzyny
  WHERE (druzyny.user_id = auth.uid()))));


--
-- Name: treningi trener_insert_treningi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trener_insert_treningi ON public.treningi FOR INSERT WITH CHECK ((druzyna_id IN ( SELECT druzyny.id
   FROM public.druzyny
  WHERE (druzyny.user_id = auth.uid()))));


--
-- Name: zawodnicy trener_insert_zawodnicy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trener_insert_zawodnicy ON public.zawodnicy FOR INSERT WITH CHECK ((druzyna_id IN ( SELECT druzyny.id
   FROM public.druzyny
  WHERE (druzyny.user_id = auth.uid()))));


--
-- Name: treningi trener_select_treningi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trener_select_treningi ON public.treningi FOR SELECT USING ((druzyna_id IN ( SELECT druzyny.id
   FROM public.druzyny
  WHERE (druzyny.user_id = auth.uid()))));


--
-- Name: zawodnicy trener_select_zawodnicy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trener_select_zawodnicy ON public.zawodnicy FOR SELECT USING ((druzyna_id IN ( SELECT druzyny.id
   FROM public.druzyny
  WHERE (druzyny.user_id = auth.uid()))));


--
-- Name: treningi trener_update_treningi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trener_update_treningi ON public.treningi FOR UPDATE USING ((druzyna_id IN ( SELECT druzyny.id
   FROM public.druzyny
  WHERE (druzyny.user_id = auth.uid()))));


--
-- Name: zawodnicy trener_update_zawodnicy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trener_update_zawodnicy ON public.zawodnicy FOR UPDATE USING ((druzyna_id IN ( SELECT druzyny.id
   FROM public.druzyny
  WHERE (druzyny.user_id = auth.uid()))));


--
-- Name: treningi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.treningi ENABLE ROW LEVEL SECURITY;

--
-- Name: user_consents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

--
-- Name: zawodnicy; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.zawodnicy ENABLE ROW LEVEL SECURITY;

--
-- Name: zgloszenia; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.zgloszenia ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict H0AmtLT8ziPMAQL0s1AVP4ehPSyMqb6O9cTAYmgE2HjggvNM3ims7VSZwxacTSk

