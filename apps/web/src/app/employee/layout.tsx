import Sidebar from "@/components/Sidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: 360, padding: "40px", flex: 1, width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
