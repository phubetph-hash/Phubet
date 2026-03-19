"use client";

export default function StudentLayout({ children }) {
  return (
    <div>
      <header style={{ background: "#f0f0f0", padding: "1rem" }}>
        <h2>Student Dashboard</h2>
      </header>
      <main>{children}</main>
    </div>
  );
}
