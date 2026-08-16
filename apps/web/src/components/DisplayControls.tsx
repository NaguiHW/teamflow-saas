"use client";

import { Languages, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocalePreference } from "../i18n/LocaleProvider";
import { useTheme } from "../theme/ThemeProvider";
import styles from "./DisplayControls.module.scss";

const DisplayControls = () => {
  const common = useTranslations("common");
  const { locale, setLocale } = useLocalePreference();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.controls} aria-label={common("displayPreferences")}>
      <button
        className={styles.control}
        type="button"
        aria-label={common("switchLanguage")}
        title={common("switchLanguage")}
        onClick={() => setLocale(locale === "en" ? "es" : "en")}
      >
        <Languages aria-hidden="true" size={16} />
        <span>{locale.toUpperCase()}</span>
      </button>
      <button
        className={styles.control}
        type="button"
        aria-label={common("switchTheme")}
        title={common("switchTheme")}
        aria-pressed={theme === "dark"}
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <Sun aria-hidden="true" size={17} />
        ) : (
          <Moon aria-hidden="true" size={17} />
        )}
        <span>{theme === "dark" ? common("light") : common("dark")}</span>
      </button>
    </div>
  );
};

export default DisplayControls;
