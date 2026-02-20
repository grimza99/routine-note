import { ResetPasswordForm } from '@/features/auth';

export default function PasswordResetPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <section className="w-full max-w-105  border border-border bg-white px-6 py-8 shadow-sm rounded-lg flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-primary">비밀번호 재설정</h1>
        </header>
        <ResetPasswordForm />
      </section>
    </div>
  );
}
