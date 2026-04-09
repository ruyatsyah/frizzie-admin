import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata = {
  title: "FrizzieSmartClub Admin",
  description: "Sistem Manajemen Les FrizzieSmartClub",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
