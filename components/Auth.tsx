
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, LogIn, UserPlus, Loader2, ArrowUpCircle, AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        // Profiles are handled by SQL triggers or manual upsert in App.tsx fetch
        setSuccess("Conta criada com sucesso! Verifique seu e-mail se necessário ou faça login.");
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-indigo-900/40 transform -rotate-6">
             <ArrowUpCircle size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">FinanceFlow</h1>
          <p className="text-slate-400 text-center font-medium">Controle total da sua vida financeira.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex bg-slate-800/50 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${!isSignUp ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <LogIn size={18} />
              Login
            </button>
            <button 
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isSignUp ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <UserPlus size={18} />
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-sm animate-in shake duration-300">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">E-mail</label>
              <div className="relative group">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 focus:bg-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Senha</label>
              <div className="relative group">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 focus:bg-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isSignUp ? 'Finalizar Cadastro' : 'Entrar no App'}
                  <div className="group-hover:translate-x-1 transition-transform">
                    <LogIn size={20} />
                  </div>
                </>
              )}
            </button>
          </form>

          {!isSignUp && (
            <div className="mt-8 text-center">
              <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Ao continuar, você concorda com os <br />
          <span className="text-slate-400 font-bold hover:underline cursor-pointer">Termos de Serviço</span> e <span className="text-slate-400 font-bold hover:underline cursor-pointer">Privacidade</span>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
