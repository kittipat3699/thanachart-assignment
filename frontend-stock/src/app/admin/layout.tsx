import { AdminFrame } from "@/components/admin/admin-frame";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <AdminFrame>{children}</AdminFrame>;
}
