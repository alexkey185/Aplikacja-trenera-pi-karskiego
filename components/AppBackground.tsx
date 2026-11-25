'use client';

export function AppBackground() {
  return (
    <>
      {/* Tło desktopowe (pobiera się tylko na md+) */}
      <div className="app-bg-desktop" aria-hidden="true" />
      
      {/* Warstwa przyciemniająca (zawsze na dole) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-[#020617]"
        aria-hidden="true"
      />
    </>
  );
}