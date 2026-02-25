import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { usePercentageStore } from '../store/usePercentageStore';
import { useThemeStore } from '../store/useThemeStore';
import { useDatasetStore } from '../store/useDatasetStore';
import { apiClient } from '../lib/api/client';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const fetchSettings = usePercentageStore((s) => s.fetchSettings);
  const setTheme = useThemeStore((s) => s.setTheme);
  const fetchDatasets = useDatasetStore((s) => s.fetchDatasets);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      // Load user data after login
      await Promise.all([
        fetchEmployees(),
        fetchSettings(),
        fetchDatasets(),
        apiClient.getSettings().then((settings) => {
          setTheme(settings.theme as 'dark' | 'light');
        }).catch(() => {}),
      ]);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-cyan-400 text-center mb-2">
          HR Performance Calibration
        </h1>
        <p className="text-slate-400 text-center text-sm mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 text-sm border rounded-lg bg-slate-700 border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-10 text-sm border rounded-lg bg-slate-700 border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
