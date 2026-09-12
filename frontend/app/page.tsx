import { Dashboard } from "@/components/Dashboard";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden px-3 py-5 sm:px-5 max-lg:pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <Dashboard />
    </main>
  );
}
