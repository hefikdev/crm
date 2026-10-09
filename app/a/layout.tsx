import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Sidebar } from "@/components/crm/sidebar";
import { CommandPalette } from "@/components/crm/command-palette";
import { redirect } from "next/navigation";

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto w-[90%] max-w-[1200px] py-6">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}