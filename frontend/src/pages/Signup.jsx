import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Building2, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side input validations
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await signup(fullName, email, phoneNumber, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      toast.success("Account created successfully!");
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Decorative Visual Column (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-800 to-primary-950 p-12 text-white lg:flex">
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
            Get Started with PlotCRM
          </h2>
          <p className="text-lg text-primary-100/90 leading-relaxed font-light">
            Create an agent account to organize your plots, keep track of buyers, and close deals faster with AI-generated templates.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-700/50 text-xs font-bold">✓</span>
              <span className="font-light">Unlimited Plot Listings</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-700/50 text-xs font-bold">✓</span>
              <span className="font-light">Interactive Customer Reminder System</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-700/50 text-xs font-bold">✓</span>
              <span className="font-light">Vastu Facing & Amenities Filter</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-200">
          © {new Date().getFullYear()} PlotCRM. Designed for real-estate excellence.
        </div>
      </div>

      {/* Signup Form Column */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 lg:hidden mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">PlotCRM</span>
            </div>
            
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Create Agent Account
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join now and streamline your real estate business.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sanjay Sharma"
                    required
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-950 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 focus:outline-none text-sm transition-shadow shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sanjay@realestate.com"
                    required
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-950 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 focus:outline-none text-sm transition-shadow shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-955 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 focus:outline-none text-sm transition-shadow shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      required
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-955 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 focus:outline-none text-sm transition-shadow shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      required
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-955 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 focus:outline-none text-sm transition-shadow shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 font-bold text-white shadow-lg shadow-primary-500/10 hover:bg-primary-700 hover:shadow-primary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 transition-all duration-150"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Register <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
