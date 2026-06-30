import { en } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";
import { zh } from "./dictionaries/zh";

const dictionaries = {
  en,
  fr,
  zh,
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = (locale: string) => {
  return dictionaries[locale as Locale] ?? dictionaries.en;
};
