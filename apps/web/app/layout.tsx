import type { Metadata } from "next";
import "./globals.scss";
import "react-toastify/dist/ReactToastify.css";
import MockApiProvider from "../src/mocks/MockApiProvider";

export const metadata: Metadata = {
  title: "TeamFlow",
  description: "A focused workspace for teams to coordinate operational work.",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body>
      <MockApiProvider>{children}</MockApiProvider>
    </body>
  </html>
);

export default RootLayout;
