"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { Space_Grotesk, Manrope } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface Player {
  id: number;
  initials: string;
  name: string;
  status: "present" | "absent" | null;
}

// Zaktualizowana lista zawodników na podstawie Twojego projektu (image_f3bf26.jpg)
const initialPlayers: Player[] = [
  { id: 1, initials: "JB", name: "Jan Barański", status: "present" },
  { id: 2, initials: "PB", name: "Paweł Barański", status: "present" },
  { id: 3, initials: "TH", name: "Tymon Holona", status: "present" },
  { id: 4, initials: "FK", name: "Franek Kąsek", status: "absent" },
];

export default function LandingPage() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [email, setEmail] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const hwRef = useRef<HTMLDivElement>(null);

  const updateStatus = (playerId: number, status: "present" | "absent") => {
    setPlayers((prev) =>
      prev.map((player) => (player.id === playerId ? { ...player, status } : player))
    );
  };

  const presentCount = useMemo(() => players.filter((p) => p.status === "present").length, [players]);
  const absentCount = useMemo(() => players.filter((p) => p.status === "absent").length, [players]);
  const percentage = Math.round((presentCount / players.length) * 100) || 0;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (hwRef.current) {
        const rect = hwRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hwRef.current.style.setProperty("--mx", `${x}%`);
        hwRef.current.style.setProperty("--my", `${y}%`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitStatus("loading");
    
    const { error } = await supabase.from("waitlist").insert([{ email }]);
    
    if (error) {
      console.error(error);
      setSubmitStatus("error");
    } else {
      setSubmitStatus("success");
      setEmail("");
    }
  };

  return (
    <>
      <style jsx global>{`
        body { margin: 0; background: #0a0e1a; color: #e2e8f0; font-family: ${manrope.style.fontFamily}, system-ui, sans-serif; font-size: 17px; line-height: 1.6; }
        h1, h2, h3, .logo, .num, .demo-title h3, .demo-stats-numbers, .mq span, #intro .lg { font-family: ${spaceGrotesk.style.fontFamily}, system-ui, sans-serif; }
        h1, h2, h3 { margin: 0; color: #fff; line-height: 1.1; }
        p { margin: 0; }
        a { color: #4ade80; }
        a:hover { color: #86efac; }
        .wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; box-sizing: border-box; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; }
        .logo { font-weight: 700; font-size: 30px; color: #fff; text-decoration: none; }
        .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #22c55e; margin-left: 3px; }
        .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px; border-radius: 12px; font-weight: 700; font-size: 16px; text-decoration: none; box-sizing: border-box; cursor: pointer; border: none; }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-p { background: #22c55e; color: #052e16; }
        .btn-p:hover:not(:disabled) { background: #4ade80; color: #052e16; }
        .btn-s { border: 1px solid #475569; color: #e2e8f0; background: transparent; }
        .btn-s:hover { border-color: #4ade80; color: #4ade80; }
        .eyebrow { color: #4ade80; font-weight: 700; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }
        .h1 { font-size: clamp(40px, 6.2vw, 72px); }
        .green { color: #4ade80; }
        .lead { font-size: 20px; color: #cbd5e1; margin-top: 20px; max-width: 34em; }
        .ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
        .sec { padding: 80px 0; border-top: 1px solid #1e293b; }
        .h2 { font-size: clamp(30px, 4.2vw, 46px); }
        .sub { color: #94a3b8; margin-top: 14px; max-width: 38em; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 20px; margin-top: 40px; }
        .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 26px; transition: transform .2s ease, border-color .2s ease; }
        .card:hover { transform: translateY(-4px); border-color: #16a34a; }
        .ico { width: 44px; height: 44px; border-radius: 12px; background: #14301f; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
        .card h3 { font-size: 22px; margin-bottom: 8px; }
        .card p { color: #94a3b8; font-size: 16px; }
        .split { display: grid; grid-template-columns: 1fr 1.15fr; gap: 56px; align-items: center; }
        .ticks { list-style: none; margin: 24px 0 0; padding: 0; display: grid; gap: 12px; }
        .ticks li { display: flex; gap: 12px; align-items: flex-start; color: #cbd5e1; }
        .ticks svg { flex: none; margin-top: 4px; }
        .cta-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 56px 32px; text-align: center; }
        .foot { border-top: 1px solid #1e293b; padding: 32px 0 48px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: center; color: #94a3b8; font-size: 15px; }
        .foot a { color: #94a3b8; margin-left: 20px; text-decoration: none; }
        .foot a:hover { color: #4ade80; }
        .bar { position: sticky; top: 0; z-index: 20; background: rgba(10, 14, 26, .88); backdrop-filter: blur(10px); border-bottom: 1px solid #1e293b; }
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 36px; }
        .step { padding: 8px 4px; }
        .num { font-weight: 700; font-size: 56px; line-height: 1; color: #22c55e; }
        .step h3 { font-size: 22px; margin: 12px 0 8px; }
        .step p { color: #94a3b8; font-size: 16px; }
        #intro { position: fixed; inset: 0; z-index: 100; background: #0a0e1a; display: grid; place-items: center; animation: introOut .5s ease 1.75s forwards; }
        #intro .lg { font-weight: 700; font-size: clamp(48px, 12vw, 120px); color: #fff; display: flex; align-items: center; opacity: 0; animation: fadeIn .6s ease .15s forwards; }
        #intro .bd { width: .11em; height: .11em; min-width: 10px; min-height: 10px; border-radius: 50%; background: #22c55e; margin-left: .04em; margin-top: .5em; animation: ball 1s cubic-bezier(.6, 0, .2, 1) .9s forwards; }
        @keyframes ball { 0% { transform: scale(1); } 100% { transform: scale(260); } }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes introOut { to { opacity: 0; visibility: hidden; } }
        .hw { position: relative; overflow: hidden; --mx: 30%; --my: 20%; background: radial-gradient(520px 520px at var(--mx) var(--my), rgba(34, 197, 94, .17), transparent 70%), radial-gradient(700px 420px at 100% 40%, rgba(59, 130, 246, .13), transparent 70%); }
        .pitch { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .22; pointer-events: none; }
        .pitch * { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw 2.6s ease 1.4s forwards; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        .hero2 { position: relative; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 56px; align-items: center; padding: 56px 0 96px; }
        .w { display: inline-block; opacity: 0; transform: translateY(46px) rotate(2deg); animation: rise .9s cubic-bezier(.2, .8, .2, 1) forwards; }
        .w0 { animation-delay: 1.55s; }
        .w1 { animation-delay: 1.65s; }
        .w2 { animation-delay: 1.75s; }
        .w3 { animation-delay: 1.85s; }
        .fd { opacity: 0; animation: rise .9s ease forwards; animation-delay: 2.1s; }
        .demo-wrap { perspective: 1200px; opacity: 0; animation: rise 1s cubic-bezier(.2, .8, .2, 1) 2.2s forwards; }
        
        /* NOWY DESIGN DEMO NA BAZIE ZDJĘCIA */
        .demo { background: #161c2d; border: 1px solid #2d3748; border-radius: 16px; padding: 20px; box-shadow: 0 40px 90px rgba(0,0,0,.6), 0 0 0 1px rgba(34,197,94,.12); }
        .demo-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .demo-icon { width: 42px; height: 42px; border-radius: 12px; background: #22c55e; display: flex; align-items: center; justify-content: center; }
        .demo-title h3 { font-size: 20px; margin-bottom: 2px; }
        .demo-title p { font-size: 13px; color: #a0aec0; }
        .demo-stats { background: #1e2536; border: 1px solid #2d3748; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
        .demo-stats-top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; }
        .demo-stats-numbers { font-size: 28px; font-weight: 700; color: #fff; line-height: 1; }
        .demo-stats-numbers span { font-size: 16px; font-weight: 500; color: #a0aec0; font-family: ${manrope.style.fontFamily}; }
        .demo-stats-sub { font-size: 13px; color: #a0aec0; margin-top: 6px; font-weight: 500; }
        .demo-bar-bg { height: 4px; background: #2d3748; border-radius: 2px; overflow: hidden; }
        .demo-bar-fg { height: 100%; background: #eab308; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .demo-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #1e2536; border-radius: 12px; margin-bottom: 8px; border: 1px solid #2d3748; transition: border-color 0.2s; }
        .demo-row:hover { border-color: #4a5568; }
        .demo-av { width: 38px; height: 38px; border-radius: 8px; background: #2d3748; color: #cbd5e1; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex: none; }
        .demo-nm { flex: 1; line-height: 1.3; }
        .demo-nm b { display: block; color: #fff; font-size: 15px; }
        .demo-nm span { font-size: 12px; font-weight: 600; }
        .demo-actions { display: flex; gap: 8px; }
        .demo-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #2d3748; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: #a0aec0; }
        .demo-btn:hover { background: #2d3748; color: #fff; }
        .demo-btn.active-present { background: #16a34a; border-color: #16a34a; color: #fff; box-shadow: 0 0 15px rgba(22, 163, 74, 0.3); }
        .demo-btn.active-absent { background: #dc2626; border-color: #dc2626; color: #fff; box-shadow: 0 0 15px rgba(220, 38, 38, 0.3); }

        .form-group { display: flex; gap: 12px; width: 100%; max-width: 400px; margin: 0 auto 16px; }
        .input { flex: 1; min-height: 48px; border-radius: 12px; border: 1px solid #334155; background: #1e293b; color: #fff; padding: 0 16px; font-size: 16px; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: #22c55e; }
        
        .mq { overflow: hidden; border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 18px 0; background: #0a0e1a; }
        .mq div { display: flex; width: max-content; animation: mq 30s linear infinite; }
        .mq span { font-weight: 700; font-size: clamp(28px, 5vw, 52px); color: transparent; -webkit-text-stroke: 1px #475569; padding: 0 28px; white-space: nowrap; }
        .mq span:nth-child(3n) { -webkit-text-stroke: 0; color: #22c55e; }
        @keyframes mq { to { transform: translateX(-50%); } }
        @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @media (max-width: 860px) {
          .hero2, .split { grid-template-columns: 1fr; gap: 32px; }
          .sec { padding: 56px 0; }
          .ctas .btn { width: 100%; }
          .form-group { flex-direction: column; }
        }
      `}</style>

      <div id="intro" aria-hidden="true">
        <div className="lg">talent<span className="bd"></span></div>
      </div>

      <div>
        <div className="bar">
          <div className="wrap">
            <div className="nav">
              <a className="logo" href="#">talent<span className="dot"></span></a>
              <a className="btn btn-p" href="#testy">Zapisz się na testy</a>
            </div>
          </div>
        </div>

        <div className="hw" ref={hwRef}>
          <svg className="pitch" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#22c55e" strokeWidth="2" aria-hidden="true">
            <rect pathLength="1" x="40" y="40" width="1120" height="620" rx="6"></rect>
            <path pathLength="1" d="M600 40V660"></path>
            <circle pathLength="1" cx="600" cy="350" r="110"></circle>
            <rect pathLength="1" x="40" y="190" width="170" height="320"></rect>
            <rect pathLength="1" x="990" y="190" width="170" height="320"></rect>
          </svg>
          <div className="wrap">
            <div className="hero2">
              <div>
                <div className="eyebrow fd">Aplikacja dla trenerów piłki nożnej młodzieżowej</div>
                <h1 className="h1">
                  <span className="w w0">Twoja</span>{" "}
                  <span className="w w1">drużyna,</span>{" "}
                  <span className="w w2 green">Twoje</span>{" "}
                  <span className="w w3 green">zasady.</span>
                </h1>
                <p className="lead fd">
                  Obecność i plan treningów w jednym miejscu. Koniec z kartkami, Excelem i szukaniem wiadomości na grupach.
                </p>
                <div className="ctas fd">
                  <a className="btn btn-p" href="#testy">Zapisz się na testy</a>
                  <a className="btn btn-s" href="#funkcje">Zobacz, jak to działa</a>
                </div>
              </div>
              <div className="demo-wrap" id="dw">
                {/* NOWY MODUŁ DEMO ODWZOROWUJĄCY PROJEKT */}
                <div className="demo">
                  <div className="demo-header">
                    <div className="demo-icon">
                      <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div className="demo-title">
                      <h3>Obecność</h3>
                      <p>🏃 Trening · Dzisiaj, 17:00</p>
                    </div>
                  </div>

                  <div className="demo-stats">
                    <div className="demo-stats-top">
                      <div>
                        <div className="demo-stats-numbers">{presentCount} <span>/ {players.length}</span></div>
                        <div className="demo-stats-sub">
                          <span style={{ color: "#22c55e" }}>obecnych</span> · <span style={{ color: "#ef4444" }}>{absentCount} nieob.</span>
                        </div>
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{percentage}%</div>
                    </div>
                    <div className="demo-bar-bg">
                      <div className="demo-bar-fg" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>

                  <div>
                    {players.map((p) => (
                      <div key={p.id} className="demo-row">
                        <div className="demo-av">{p.initials}</div>
                        <div className="demo-nm">
                          <b>{p.name}</b>
                          {p.status === "present" && <span style={{ color: "#22c55e" }}>Obecny</span>}
                          {p.status === "absent" && <span style={{ color: "#ef4444" }}>Nieobecny</span>}
                          {p.status === null && <span style={{ color: "#94a3b8" }}>Brak statusu</span>}
                        </div>
                        <div className="demo-actions">
                          {/* Przycisk Obecny [V] */}
                          <button
                            type="button"
                            className={`demo-btn ${p.status === "present" ? "active-present" : ""}`}
                            onClick={() => updateStatus(p.id, "present")}
                            title="Obecny"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </button>
                          
                          {/* Przycisk Nieobecny [X] */}
                          <button
                            type="button"
                            className={`demo-btn ${p.status === "absent" ? "active-absent" : ""}`}
                            onClick={() => updateStatus(p.id, "absent")}
                            title="Nieobecny"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mq" aria-hidden="true">
          <div>
            <span>KADRA</span><span>KALENDARZ</span><span>FREKWENCJA</span><span>STATYSTYKI</span><span>EKSPORT PDF</span><span>TELEFON I KOMPUTER</span>
            <span>KADRA</span><span>KALENDARZ</span><span>FREKWENCJA</span><span>STATYSTYKI</span><span>EKSPORT PDF</span><span>TELEFON I KOMPUTER</span>
          </div>
        </div>

        <div className="sec">
          <div className="wrap">
            <h2 className="h2">Jak to działa</h2>
            <div className="steps">
              <div className="step">
                <div className="num">1</div>
                <h3>Dodaj drużynę</h3>
                <p>Wpisz zawodników z rocznikiem, pozycją i numerem.</p>
              </div>
              <div className="step">
                <div className="num">2</div>
                <h3>Zaplanuj treningi i mecze</h3>
                <p>Wszystko w kalendarzu, każde wydarzenie w swoim kolorze.</p>
              </div>
              <div className="step">
                <div className="num">3</div>
                <h3>Zaznaczaj obecność</h3>
                <p>Kropki przy zawodnikach i statystyki drużyny liczą się same.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sec" id="funkcje">
          <div className="wrap">
            <h2 className="h2">Wszystko, czego trener potrzebuje na co dzień</h2>
            <p className="sub">Tylko to, co naprawdę przydaje się przy prowadzeniu drużyny dzieci i młodzieży.</p>
            <div className="grid">
              <div className="card">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3>Kadra</h3>
                <p>Lista zawodników z rocznikiem, pozycją i numerem. Szukaj, sortuj, miej wszystko pod ręką.</p>
              </div>
              <div className="card">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>
                </div>
                <h3>Kalendarz</h3>
                <p>Treningi, mecze, sparingi i turnieje w jednym kalendarzu, każde w swoim kolorze.</p>
              </div>
              <div className="card">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.5"></circle><circle cx="10" cy="12" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="20" cy="12" r="1.5"></circle></svg>
                </div>
                <h3>Frekwencja na pierwszy rzut oka</h3>
                <p>Przy każdym zawodniku widzisz kropki z ostatnich treningów i od razu wiesz, kto przestał przychodzić.</p>
              </div>
              <div className="card">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"></path></svg>
                </div>
                <h3>Statystyki</h3>
                <p>Średnia frekwencja, wykres miesięczny, ranking obecności i lista zawodników do poprawy.</p>
              </div>
              <div className="card">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"></path></svg>
                </div>
                <h3>Eksport do PDF</h3>
                <p>Wydrukuj kalendarz albo wyślij go dalej, kiedy potrzebujesz wersji na papierze.</p>
              </div>
              <div className="card">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"></rect><path d="M12 18h.01"></path></svg>
                </div>
                <h3>Telefon i komputer</h3>
                <p>Działa w przeglądarce i można ją dodać do ekranu głównego. Bez instalowania ze sklepu.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sec">
          <div className="wrap">
            <div className="split">
              <div>
                <h2 className="h2">Frekwencja bez liczenia</h2>
                <p className="sub">Zamiast przeglądać kartki, wybierasz okres i widzisz obraz drużyny.</p>
                <ul className="ticks">
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                    <span>Okres do wyboru: 30 dni, 3 miesiące, sezon albo cały okres</span>
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                    <span>Wykres miesiąc po miesiącu pokazuje trend</span>
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                    <span>Ranking obecności i lista zawodników z frekwencją poniżej 70%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="sec" id="testy">
          <div className="wrap">
            <div className="cta-box">
              <h2 className="h2">Dołącz do testów talent.</h2>
              <p className="sub" style={{ marginBottom: "24px" }}>Aplikacja powstaje we współpracy z trenerami. Zostaw kontakt, aby otrzymać bezpłatny dostęp testowy.</p>
              
              <form onSubmit={handleSubscribe} className="form-group">
                <input 
                  type="email" 
                  className="input" 
                  placeholder="Twój adres e-mail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitStatus === "loading" || submitStatus === "success"}
                />
                <button 
                  type="submit" 
                  className="btn btn-p"
                  disabled={submitStatus === "loading" || submitStatus === "success"}
                >
                  {submitStatus === "loading" ? "Zapisywanie..." : submitStatus === "success" ? "Zapisano!" : "Zarejestruj się"}
                </button>
              </form>
              
              {submitStatus === "success" && (
                <p style={{ color: "#4ade80", fontSize: "14px" }}>Dziękujemy! Odezwiemy się wkrótce.</p>
              )}
              {submitStatus === "error" && (
                <p style={{ color: "#f87171", fontSize: "14px" }}>Wystąpił błąd. Spróbuj ponownie lub użyj innego e-maila.</p>
              )}
            </div>
          </div>
        </div>

        <div className="foot">
          <div className="wrap" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div>&copy; {new Date().getFullYear()} talent. Wszelkie prawa zastrzeżone.</div>
            <div>
              <a href="#">Polityka prywatności</a>
              <a href="#">Regulamin</a>
              <a href="#">Kontakt</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}