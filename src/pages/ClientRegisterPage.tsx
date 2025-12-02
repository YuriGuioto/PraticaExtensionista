import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ClientRegisterPage = () => {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('success');
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <section className="relative isolate min-h-screen w-full bg-tapioca px-4 py-16">
      <div className="relative mx-auto max-w-md rounded-3xl border border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
      <header className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] bg-gradient-to-r from-acai-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Cadastro rápido
        </p>
        <h1 className="text-3xl font-black text-slate-900">Crie sua conta</h1>
        <p className="text-sm text-slate-500">
          Cadastre-se para salvar preferências, acompanhar pedidos e receber novidades exclusivas.
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
          <label className="text-xs font-semibold text-slate-600" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="voce@email.com"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="contact">
            Telefone / WhatsApp
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
          <label className="text-xs font-semibold text-slate-600" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="********"
          />
        </div>
        {status === 'success' && (
          <p className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Cadastro enviado! Você será redirecionado para o login em instantes.
          </p>
        )}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-acai-600 to-indigo-500 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:scale-[1.01]"
        >
          Cadastrar
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
      </div>
    </section>
  );
};
