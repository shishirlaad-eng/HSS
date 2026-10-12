// ─────────────────────────────────────────────────────────────
// HSS UK — Public Policies
// Policy pages are public: /policies lists the Visible policies and
// /policies/<url-extension> opens one — no login required.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import Policies from './Policies';
import PolicyView from './PolicyView';
import { findPolicy, policyPath } from '../../mockAPI/staticPagesData';

/** Returns the policy reference in a /policies or /policies/<ref> URL, `null` for the list, `undefined` when not a policies URL. */
export function parsePolicyPath(pathname: string): string | null | undefined {
  const m = pathname.match(/^\/policies(?:\/([^/]+))?\/?$/);
  if (!m) return undefined;
  return m[1] ? decodeURIComponent(m[1]) : null;
}

export default function PublicPolicies({ initialRef }: { initialRef: string | null }) {
  const [ref, setRef] = useState<string | null>(initialRef);

  useEffect(() => {
    const onPop = () => setRef(parsePolicyPath(window.location.pathname) ?? null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const open = (id: string) => {
    const page = findPolicy(id);
    if (!page) return;
    window.history.pushState({}, '', policyPath(page));
    setRef(page.slug);
  };

  const back = () => {
    window.history.pushState({}, '', '/policies');
    setRef(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="bg-[#172E4D] text-white px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-wide">My HSS</span>
        <a href="/" className="text-sm underline underline-offset-2 hover:text-white/80">Sign in</a>
      </header>
      {ref ? <PolicyView policyId={ref} onBack={back} /> : <Policies onSelectPolicy={open} />}
    </div>
  );
}
