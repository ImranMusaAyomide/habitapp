import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-4">
            <span className="text-white text-2xl">✦</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
            Habit Tracker
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Create your account</p>
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
