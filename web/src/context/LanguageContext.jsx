import { createContext, useCallback, useMemo, useState } from 'react';

// Chichewa copy is a first draft and should be reviewed by a fluent speaker before release.
const messages = {
  en: {
    'nav.dashboard': 'Home',
    'nav.diagnosis': 'Check my crop',
    'nav.planting': 'Can I plant?',
    'nav.recommendations': 'What to plant',
    'nav.officer': 'Outbreaks',
    'nav.admin': 'Admin',
    'nav.profile': 'My profile',
    'nav.logout': 'Log out',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.retry': 'Try again',
    'common.add_farm': 'Add farm',
    'common.add_first_farm': 'Add your first farm',
    'common.alerts': 'Alerts',
    'common.my_farms': 'My farms',
    'common.recent_checks': 'Recent crop checks',
    'common.hello': 'Hello',
    'auth.name': 'Your name',
    'auth.phone': 'Phone number',
    'auth.password': 'Password',
    'auth.password_hint': 'At least 8 characters',
    'auth.role': 'I am a',
    'auth.farmer': 'Farmer',
    'auth.field_agent': 'Field agent',
    'auth.language': 'Language',
    'auth.create_account': 'Create account',
    'auth.already_registered': 'Already registered?',
    'auth.login': 'Log in',
    'auth.new_to_farmai': 'New to FarmAI?',
    'auth.create_an_account': 'Create an account',
    'farm.name': 'Farm name',
    'farm.district': 'District',
    'farm.choose_district': 'Choose a district',
    'farm.soil_type': 'Soil type',
    'farm.size': 'Size (hectares)',
    'farm.location_needed': 'Location is needed for weather and planting advice.',
    'farm.use_location': 'Use my location',
    'farm.location_unsupported': 'Location is not supported on this device.',
    'farm.location_added': 'Location added.',
    'farm.location_failed': 'Could not get your location. You can type it in.',
    'farm.latitude': 'Latitude',
    'farm.longitude': 'Longitude',
    'farm.save': 'Save farm',
    'farm.add_title': 'Add a farm',
    'profile.title': 'My profile',
    'profile.saved': 'Saved.',
    'profile.phone': 'Phone',
    'profile.role': 'Role',
  },
  ny: {
    'nav.dashboard': 'Kunyumba',
    'nav.diagnosis': 'Yang’anani mbewu zanga',
    'nav.planting': 'Kodi ndingabzale?',
    'nav.recommendations': 'Zoyenera kubzala',
    'nav.officer': 'Miliri ya mbewu',
    'nav.admin': 'Woyang’anira',
    'nav.profile': 'Mbiri yanga',
    'nav.logout': 'Tulukani',
    'common.loading': 'Ikutsegula...',
    'common.save': 'Sungani',
    'common.cancel': 'Letsani',
    'common.retry': 'Yesaninso',
    'common.add_farm': 'Onjezani munda',
    'common.add_first_farm': 'Onjezani munda wanu woyamba',
    'common.alerts': 'Machenjezo',
    'common.my_farms': 'Minda yanga',
    'common.recent_checks': 'Kuyang’ana mbewu kwaposachedwa',
    'common.hello': 'Moni',
    'auth.name': 'Dzina lanu',
    'auth.phone': 'Nambala ya foni',
    'auth.password': 'Mawu achinsinsi',
    'auth.password_hint': 'Zilembo zosachepera 8',
    'auth.role': 'Ndine',
    'auth.farmer': 'Mlimi',
    'auth.field_agent': 'Wothandiza alimi',
    'auth.language': 'Chinenero',
    'auth.create_account': 'Pangani akaunti',
    'auth.already_registered': 'Muli ndi akaunti kale?',
    'auth.login': 'Lowani',
    'auth.new_to_farmai': 'Kodi ndinu watsopano ku FarmAI?',
    'auth.create_an_account': 'Pangani akaunti',
    'farm.name': 'Dzina la munda',
    'farm.district': 'Chigawo',
    'farm.choose_district': 'Sankhani chigawo',
    'farm.soil_type': 'Mtundu wa nthaka',
    'farm.size': 'Kukula kwa munda (mahekitala)',
    'farm.location_needed': 'Malo a munda amafunika kuti mupeze nyengo ndi malangizo obzala.',
    'farm.use_location': 'Gwiritsani ntchito malo amene ndili',
    'farm.location_unsupported': 'Chipangizochi sichitha kudziwa malo amene muli.',
    'farm.location_added': 'Malo awonjezedwa.',
    'farm.location_failed': 'Talephera kudziwa malo anu. Mungalembe nokha.',
    'farm.latitude': 'Latitude',
    'farm.longitude': 'Longitude',
    'farm.save': 'Sungani munda',
    'farm.add_title': 'Onjezani munda',
    'profile.title': 'Mbiri yanga',
    'profile.saved': 'Zasungidwa.',
    'profile.phone': 'Foni',
    'profile.role': 'Udindo',
  },
};

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('farmai.lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang) => {
    if (!messages[lang]) return;
    setLanguageState(lang);
    try {
      localStorage.setItem('farmai.lang', lang);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((key) => messages[language]?.[key] ?? messages.en[key] ?? key, [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
