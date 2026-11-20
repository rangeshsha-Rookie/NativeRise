// client/src/tests/setup.js
import '@testing-library/jest-dom';

if (typeof window !== 'undefined' && !window.localStorage) {
  const store = {};
  window.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      for (const key in store) delete store[key];
    }
  };
}
