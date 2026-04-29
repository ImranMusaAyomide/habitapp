import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-500 rounded-2xl md:rounded-3xl mb-4 shadow-md">
            <img src="/icons/logo.svg" alt="Habit Tracker Logo" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" style={{ filter: 'brightness(0) saturate(100%) invert(60%) sepia(90%) saturate(600%) hue-rotate(90deg)' }} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
            Habit Tracker
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
