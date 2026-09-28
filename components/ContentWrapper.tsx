'use client';

import { usePathname } from 'next/navigation';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebar = pathname === '/' || pathname.startsWith('/auth');

  return (
    <div className={noSidebar ? '' : 'md:pl-60'}>
      {children}
    </div>
  );
}