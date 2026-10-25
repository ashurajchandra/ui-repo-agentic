import "./globals.css";

export const metadata = { title: "Todos", description: "A small todo list" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
