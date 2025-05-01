'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.login({ username, password });
      localStorage.setItem('token', response.access_token);
      router.push('/departments');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-secondary-color text-text-color">
      <h1 className="text-primary-color text-3xl font-bold mb-8">Login</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full">
        <label className="flex flex-col">
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded py-2 px-4"
            required
          />
        </label>
        <label className="flex flex-col">
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded py-2 px-4"
            required
          />
        </label>
        <button type="submit" className="bg-primary-color text-secondary-color py-2 px-4 rounded hover:bg-orange-500">
          Login
        </button>
      </form>
    </main>
  );
}