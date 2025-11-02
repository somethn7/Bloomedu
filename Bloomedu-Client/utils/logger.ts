// Production-safe logger
// Development'ta tüm log'lar çalışır
// Production'da sadece error'lar çalışır

const isDevelopment = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Error'lar her zaman gösterilir
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('ℹ️', ...args);
    }
  },
  
  success: (...args: any[]) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },
};

// Global console override (optional)
export const disableConsoleLogs = () => {
  if (!isDevelopment) {
    console.log = () => {};
    console.warn = () => {};
    // console.error tetiklenmeye devam eder
  }
};

