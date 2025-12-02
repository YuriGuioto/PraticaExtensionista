import { AppHeader } from './components/AppHeader.tsx';
import { AppRoutes } from './routes/AppRoutes.tsx';

const App = () => {
  return (
    <div className="min-h-screen bg-tapioca text-slate-900">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
