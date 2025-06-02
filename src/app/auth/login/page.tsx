'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [supabase, setSupabase] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSupabase = async () => {
      const { createBrowserClient } = await import('@/lib/supabase');
      const client = createBrowserClient();
      setSupabase(client);
    };

    loadSupabase();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Login response:', data, error);
      if (error) throw error;

      const redirectTo = searchParams?.get('redirectedFrom') || '/';
      router.replace(redirectTo);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
      </button>
      <div className="flex justify-between text-sm mt-2">
        <label>
          <input type="checkbox" className="mr-1" /> Remember me
        </label>
        <Link href="/auth/forgot" className="text-green-600 hover:underline">
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}

function LoginForm() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/register" className="text-green-600 hover:underline">
            create a new account
          </Link>
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

