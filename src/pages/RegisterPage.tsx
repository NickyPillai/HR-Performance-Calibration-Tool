import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { usePercentageStore } from '../store/usePercentageStore';
import { useThemeStore } from '../store/useThemeStore';
import { useDatasetStore } from '../store/useDatasetStore';
import { apiClient } from '../lib/api/client';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const fetchSettings = usePercentageStore((s) => s.fetchSettings);
  const setTheme = useThemeStore((s) => s.setTheme);
  const fetchDatasets = useDatasetStore((s) => s.fetchDatasets);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    try {
      await register(username, password);
      // Load user data after registration
      await Promise.all([
        fetchEmployees(),
        fetchSettings(),
        fetchDatasets(),
        apiClient.getSettings().then((settings) => {
          setTheme(settings.theme as 'dark' | 'light');
        }).catch(() => {}),
      ]);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-cyan-400 text-center mb-2">
          HR Performance Calibration
        </h1>
        <p className="text-slate-400 text-center text-sm mb-2">Create a new account</p>
        <p className="text-amber-400 text-center text-xs mb-8">
          The first registered user becomes the admin
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full px-4 py-2 text-sm border rounded-lg bg-slate-700 border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="At least 3 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 text-sm border rounded-lg bg-slate-700 border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 text-sm border rounded-lg bg-slate-700 border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Re-enter your password"
            />
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
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
