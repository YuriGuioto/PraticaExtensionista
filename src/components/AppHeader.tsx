import { Link, NavLink } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import { useClientSessionStore } from '../store/clientSessionStore';

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-sm font-semibold transition ${
    isActive
      ? 'bg-gradient-to-r from-acai-600 to-indigo-500 text-white shadow-lg shadow-acai-200/40'
      : 'text-slate-600 hover:text-acai-700 hover:bg-white/40'
  } backdrop-blur`;

const iconClass = 'h-4 w-4 opacity-70 transition group-hover:opacity-100';

export const AppHeader = () => {
  const { token, user, logout } = useAuthStore();
  const clientProfile = useClientSessionStore((state) => state.profile);
  const logoutClient = useClientSessionStore((state) => state.logout);

  const isAdminAuthenticated = Boolean(token);
  const isClientAuthenticated = Boolean(clientProfile);
  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/60 shadow-lg shadow-acai-100/40 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-black text-acai-700">
          <span className="rounded-2xl bg-gradient-to-r from-acai-600 to-indigo-500 p-1 text-white shadow-lg shadow-acai-200/40">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
              <path d="M12 12l8-4.5" />
              <path d="M12 12v9" />
              <path d="M12 12L4 7.5" />
            </svg>
          </span>
          Amazone Açaí - Mococa
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={navLinkClasses} end>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={iconClass}>
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
            Cardápio
          </NavLink>
          {!isClientAuthenticated && (
            <NavLink to="/cadastro" className={navLinkClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}>
                <circle cx="9" cy="8" r="4" />
                <path d="M17 11v6" />
                <path d="M20 14h-6" />
                <path d="M3 21v-1a6 6 0 0 1 6-6h0" />
              </svg>
              Cadastro
            </NavLink>
          )}
          {!isClientAuthenticated && !isAdminAuthenticated && (
            <NavLink to="/login" className={navLinkClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
              Login
            </NavLink>
          )}
          {isClientAuthenticated && (
            <>
              <span className="flex items-center gap-2 rounded-full border border-white/30 bg-white/40 px-4 py-1 text-sm font-semibold text-slate-600 backdrop-blur">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-acai-600">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
                </svg>
                Olá, {clientProfile?.name.split(' ')[0] ?? 'cliente'}
              </span>
              <button
                type="button"
                onClick={logoutClient}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/40 px-4 py-1 text-sm font-semibold text-slate-600 backdrop-blur transition hover:border-acai-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
                Sair
              </button>
            </>
          )}
          {isAdminAuthenticated ? (
            <>
              <NavLink to="/admin" className={navLinkClasses}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}>
                  <path d="M3 12h18" />
                  <path d="M12 3v18" />
                </svg>
                Painel ADM
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/40 px-4 py-1 text-sm font-semibold text-slate-600 backdrop-blur transition hover:border-acai-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
                Sair {user ? `(${user.name.split(' ')[0]})` : ''}
              </button>
            </>
          ) : (
            !isClientAuthenticated && (
              <NavLink to="/admin/login" className={navLinkClasses}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}>
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  <path d="M7 12h10" />
                  <path d="M12 7v10" />
                </svg>
                Login ADM
              </NavLink>
            )
          )}
        </nav>
      </div>
    </header>
  );
};
