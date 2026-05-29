import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  translations,
  languages,
  type Language,
  type TranslationDict,
} from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en-GB",
  setLanguage: () => {},
  t: translations["en-GB"],
  languages,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en-GB");

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
    // Set lang attribute for accessibility
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language], languages }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
