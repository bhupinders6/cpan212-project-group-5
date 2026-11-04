import "./globals.css";

export const metadata = {
  title: "Budgets | Remittance Tracker",
  description: "Set monthly budgets and track remittances against them.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
