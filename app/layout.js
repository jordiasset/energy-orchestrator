export const metadata = {
  title: "Energy Orchestrator — Certex Innova",
  description: "Dashboard de orquestación energética en tiempo real",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
