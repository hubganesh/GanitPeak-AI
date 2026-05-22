import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './translations';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  // Load saved language or default to English
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  const digitMaps = {
    hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
    kn: ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯']
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return num;
    const str = num.toString();
    if (!digitMaps[language]) return str;

    return str.split('').map(char => {
      const digit = parseInt(char);
      if (!isNaN(digit) && digitMaps[language][digit] !== undefined) {
        return digitMaps[language][digit];
      }
      return char;
    }).join('');
  };

  const t = (key, variables = {}) => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    
    // Replace variables and format numbers if they are variables
    Object.keys(variables).forEach(varKey => {
      let value = variables[varKey];
      if (typeof value === 'number') {
        value = formatNumber(value);
      }
      text = text.replace(`{{${varKey}}}`, value);
    });

    return text;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <TranslationContext.Provider value={{ language, t, formatNumber, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
