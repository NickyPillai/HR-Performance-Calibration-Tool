import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface UserRow {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [isCreating, setIsCreating] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { users } = await apiClient.getUsers();
      setUsers(users);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newUsername.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    try {
      await apiClient.createUser(newUsername, newPassword, newRole);
      toast.success(`User "${newUsername}" created successfully`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? All their data will be permanently removed.`)) {
      return;
    }
    try {
      await apiClient.deleteUser(userId);
      toast.success(`User "${username}" deleted`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  return (
    <div className={clsx('min-h-screen transition-colors', isDark ? 'bg-slate-900' : 'bg-gray-100')}>
      {/* Header */}
      <header className={clsx(
        'shadow-lg border-b',
        isDark ? 'bg-slate-800 border-cyan-500' : 'bg-white border-cyan-600'
      )}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={clsx('text-2xl font-bold', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
                Admin Panel
              </h1>
              <p className={clsx('text-sm mt-1', isDark ? 'text-slate-300' : 'text-gray-600')}>
                Manage users and access control
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className={clsx(
                'px-4 py-2 rounded-lg transition-colors border text-sm font-medium',
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-cyan-300 border-slate-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-cyan-700 border-gray-300'
              )}
            >
              Back to App
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Create User Form */}
        <section className={clsx(
          'rounded-lg shadow-lg border p-6',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <h2 className={clsx('text-lg font-semibold mb-4', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
            Create New User
          </h2>
          <form onSubmit={handleCreateUser} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className={clsx('block text-sm font-medium mb-1', isDark ? 'text-cyan-300' : 'text-gray-700')}>
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                minLength={3}
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500',
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                )}
                placeholder="At least 3 characters"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className={clsx('block text-sm font-medium mb-1', isDark ? 'text-cyan-300' : 'text-gray-700')}>
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500',
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                )}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="w-32">
              <label className={clsx('block text-sm font-medium mb-1', isDark ? 'text-cyan-300' : 'text-gray-700')}>
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500',
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                )}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </section>

        {/* Users Table */}
        <section className={clsx(
          'rounded-lg shadow-lg border overflow-hidden',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <div className={clsx(
            'px-6 py-4 border-b',
            isDark ? 'border-slate-700' : 'border-gray-200'
          )}>
            <h2 className={clsx('text-lg font-semibold', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
              All Users ({users.length})
            </h2>
          </div>

          {isLoading ? (
            <div className={clsx('p-8 text-center', isDark ? 'text-slate-400' : 'text-gray-500')}>
              Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={clsx('min-w-full divide-y', isDark ? 'divide-slate-700' : 'divide-gray-200')}>
                <thead className={isDark ? 'bg-slate-900' : 'bg-gray-50'}>
                  <tr>
                    {['ID', 'Username', 'Role', 'Created', 'Actions'].map((header) => (
                      <th key={header} className={clsx(
                        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
                        isDark ? 'text-cyan-300' : 'text-cyan-700'
                      )}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={clsx(
                  'divide-y',
                  isDark ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-100'
                )}>
                  {users.map((user) => (
                    <tr key={user.id} className={
                      user.id === currentUser?.id
                        ? (isDark ? 'bg-cyan-900/20' : 'bg-cyan-50')
                        : ''
                    }>
                      <td className={clsx('px-4 py-3 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                        {user.id}
                      </td>
                      <td className={clsx('px-4 py-3 text-sm font-medium', isDark ? 'text-slate-100' : 'text-gray-900')}>
                        {user.username}
                        {user.id === currentUser?.id && (
                          <span className={clsx('ml-2 text-xs', isDark ? 'text-cyan-400' : 'text-cyan-600')}>(you)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          user.role === 'admin'
                            ? 'bg-amber-600 text-white'
                            : isDark
                              ? 'bg-slate-600 text-slate-200'
                              : 'bg-gray-200 text-gray-700'
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className={clsx('px-4 py-3 text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
                        {new Date(user.created_at + 'Z').toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.id !== currentUser?.id ? (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className={clsx('text-xs', isDark ? 'text-slate-500' : 'text-gray-400')}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
