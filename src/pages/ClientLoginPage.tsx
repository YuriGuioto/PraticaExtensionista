import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useClientSessionStore } from '../store/clientSessionStore';

export const ClientLoginPage = () => {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const navigate = useNavigate();
  const loginClient = useClientSessionStore((state) => state.login);
  const profile = useClientSessionStore((state) => state.profile);
  const logoutClient = useClientSessionStore((state) => state.logout);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name'));
    const contact = String(formData.get('contact'));
    const codeValue = String(formData.get('code') ?? '').trim();

    loginClient({ name, contact, code: codeValue || undefined });
    setStatus('success');
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <section className="relative isolate min-h-screen w-full bg-tapioca px-4 py-16">
      <div className="relative mx-auto max-w-md rounded-3xl border border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
      <header className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] bg-gradient-to-r from-acai-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Área do cliente
        </p>
        <h1 className="text-3xl font-black text-slate-900">Identifique-se</h1>
        <p className="text-sm text-slate-500">
          Informe seus dados para acompanhar pedidos e receber notificações personalizadas.
        </p>
      </header>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="name">
            Nome completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Maria Souza"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="contact">
            Contato (WhatsApp)
          </label>
          <input
            id="contact"
            name="contact"
            type="tel"
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="(19) 98888-0000"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="code">
            Código do pedido (opcional)
          </label>
          <input
            id="code"
            name="code"
            type="text"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="#A001"
          />
        </div>
        {status === 'success' && (
          <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Login realizado! Volte ao cardápio para continuar escolhendo seus itens favoritos.
          </div>
        )}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-acai-600 to-indigo-500 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:scale-[1.01]"
        >
          Entrar
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Ainda não tem cadastro?{' '}
        <Link to="/cadastro" className="font-semibold text-acai-600 hover:text-acai-700">
          Crie sua conta
        </Link>
      </p>
      {profile && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
          Você já está conectado como <span className="font-semibold text-slate-900">{profile.name.split(' ')[0]}</span>.{' '}
          <button type="button" className="font-semibold text-acai-600 hover:text-acai-700" onClick={logoutClient}>
            Sair da conta
          </button>
        </div>
      )}
      </div>
    </section>
  );
};
