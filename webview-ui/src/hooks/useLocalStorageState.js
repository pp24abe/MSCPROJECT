
import React from 'react';
function useLocalStorageState(key, defaultValue) {
  const [state, setState] = React.useState(() => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.warn("Parsing error:", error);
      return defaultValue;
    }
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
export { useLocalStorageState };
