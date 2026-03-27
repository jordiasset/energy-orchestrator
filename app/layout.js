export const metadata = {
  title: "Energy Orchestrator — Certex Innova",
  description: "Dashboard de orquestación energética en tiempo real",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, overflowX: "hidden" }}>{children}</body>
    </html>
  );
}
