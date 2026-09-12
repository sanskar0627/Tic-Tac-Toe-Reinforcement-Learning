import { Dashboard } from "@/components/Dashboard";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden px-[max(0.75rem,env(safe-area-inset-left))] py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:px-5 sm:py-5">
      <Dashboard />
    </main>
  );
}
