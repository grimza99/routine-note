'use client';

import { useState } from 'react';
import { LoginForm, SignupForm } from '@/features/auth';
import { AUTH } from '@/entities/auth/model/constants';

type AuthTab = 'login' | 'signup';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const isLogin = activeTab === 'login';

  return (
    <section className="w-full max-w-105  border border-border bg-white px-6 py-8 shadow-sm rounded-lg">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {isLogin ? AUTH.LOGIN.TITLE : AUTH.SIGNUP.TITLE}
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? AUTH.LOGIN.DESCRIPTION : AUTH.SIGNUP.DESCRIPTION}
        </p>
      </header>

      <div
        className="mb-6 flex rounded-lg border"
        style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius-base)' }}
      >
        <button
          type="button"
          className="flex-1 py-2 text-sm font-semibold"
          onClick={() => setActiveTab('login')}
          style={{
            background: isLogin ? 'var(--primary)' : 'var(--white)',
            color: isLogin ? 'var(--white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-base)',
          }}
        >
          로그인
        </button>
        <button
          type="button"
          className="flex-1 py-2 text-sm font-semibold"
          onClick={() => setActiveTab('signup')}
          style={{
            background: isLogin ? 'var(--white)' : 'var(--primary)',
            color: isLogin ? 'var(--text-secondary)' : 'var(--white)',
            borderRadius: 'var(--radius-base)',
          }}
        >
          회원가입
        </button>
      </div>

      {isLogin ? <LoginForm /> : <SignupForm />}
    </section>
  );
}
