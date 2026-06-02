import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success("Welcome back!");
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Visual Banner (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-800 to-primary-950 p-12 text-white lg:flex">
        {/* Background Blobs */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <Building2 className="h-6 w-6 text-primary-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">PlotCRM</span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">
            Simplify Plot Management & Sales
          </h2>
          <p className="text-lg text-primary-100/90 leading-relaxed font-light">
            The premium workspace tailored specifically for Indian real estate agents. Track plots, record client interests, generate WhatsApp messages, and compose AI marketing copy with a single tap.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-2xl font-bold">SQLite DB</p>
              <p className="text-sm text-primary-200">Secure & Lightweight</p>
            </div>
            <div className="border-l border-white/20 pl-8">
              <p className="text-2xl font-bold">Groq AI</p>
              <p className="text-sm text-primary-200">Instant Listing Copy</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-200">
          © {new Date().getFullYear()} PlotCRM. Designed for real-estate excellence.
        </div>
      </div>

      {/* Login Form Column */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            {/* Logo on Mobile */}
            <div className="flex items-center gap-2 lg:hidden mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">PlotCRM</span>
            </div>
            
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Agent Portal Log In
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your real estate listings, clients, and communications.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@agency.com"
                    required
                    className="block w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-950 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 focus:outline-none text-sm transition-shadow shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-950 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 focus:outline-none text-sm transition-shadow shadow-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-primary-500/10 hover:bg-primary-700 hover:shadow-primary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 transition-all duration-150"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Log In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
