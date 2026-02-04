'use client';

import { useState } from 'react';
import { LoginForm, SignupForm } from '@/features/auth';
import { AUTH } from '@/entities/auth/model/constants';
import { cn, Tabs } from '@/shared';

type AuthTab = 'login' | 'signup';
const tabItems = [
  { id: 'login', label: '로그인' },
  { id: 'signup', label: '회원가입' },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const isLogin = activeTab === 'login';

  return (
    <section className="w-full max-w-105  border border-border bg-white px-6 py-8 shadow-sm rounded-lg flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-primary">{isLogin ? AUTH.LOGIN.TITLE : AUTH.SIGNUP.TITLE}</h1>
        <p className="mt-2 text-sm text-text-secondary">{isLogin ? AUTH.LOGIN.DESCRIPTION : AUTH.SIGNUP.DESCRIPTION}</p>
      </header>
      <Tabs items={tabItems} activeId={activeTab} onChange={(id) => setActiveTab(id as AuthTab)} />
      {isLogin ? <LoginForm /> : <SignupForm />}
    </section>
  );
}
