import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';

import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const AdminLoginPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const from = (location.state as { from?: string })?.from ?? '/admin';

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post<LoginResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      login({ token: data.token, user: data.user });
      navigate(from, { replace: true });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message ?? 'Falha ao autenticar. Tente novamente.';
      setErrorMessage(message);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    loginMutation.mutate({ email, password });
  };

  return (
    <section className="relative isolate min-h-screen w-full bg-tapioca px-4 py-16">
      <div className="relative mx-auto max-w-md rounded-3xl border border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
        <header className="mt-4 space-y-2 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] bg-gradient-to-r from-acai-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Painel do seu João
          </p>
          <h1 className="text-3xl font-black text-slate-900">Controle administrativo</h1>
          <p className="text-sm text-slate-500">
            Acesse seus pedidos, edite o cardápio e acompanhe o desempenho da loja em tempo real.
          </p>
        </header>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="email">
              E-mail corporativo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-acai-500 focus:outline-none focus:ring-2 focus:ring-acai-100"
              placeholder="admin@acaifamilia.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-acai-500 focus:outline-none focus:ring-2 focus:ring-acai-100"
              placeholder="********"
            />
          </div>
          {errorMessage && (
            <p className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-acai-600 to-indigo-500 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loginMutation.isPending ? 'Entrando...' : 'Entrar no painel'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        <div className="mt-6 space-y-2 text-center text-xs text-slate-500">
          <p>Ambiente seguro — utilize apenas em dispositivos confiáveis.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-semibold text-acai-600 transition hover:text-acai-700"
          >
            Voltar para o cardápio
          </button>
        </div>
      </div>
    </section>
  );
};
