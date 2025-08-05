'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations, Translations } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  changeLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])
  
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 