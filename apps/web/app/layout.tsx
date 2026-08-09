import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "TeamFlow",
  description: "A focused workspace for teams to coordinate operational work.",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
