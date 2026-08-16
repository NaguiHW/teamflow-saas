import type { Metadata } from "next";
import "./globals.scss";
import "react-toastify/dist/ReactToastify.css";
import MockApiProvider from "../src/mocks/MockApiProvider";
import LocaleProvider from "../src/i18n/LocaleProvider";
import ThemeProvider from "../src/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "TeamFlow",
  description: "A focused workspace for teams to coordinate operational work.",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body>
      <ThemeProvider>
        <LocaleProvider>
          <MockApiProvider>{children}</MockApiProvider>
        </LocaleProvider>
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
