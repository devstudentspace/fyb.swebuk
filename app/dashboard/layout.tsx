import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { GlobalCallManager } from "@/components/chat/global-call-manager";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardWrapper>
      <GlobalCallManager />
      {children}
    </DashboardWrapper>
  );
}