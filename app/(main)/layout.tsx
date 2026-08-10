import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden w-full bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
