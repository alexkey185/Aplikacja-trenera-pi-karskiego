export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}