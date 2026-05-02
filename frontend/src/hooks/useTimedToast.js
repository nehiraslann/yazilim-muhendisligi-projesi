import { useEffect, useRef, useState } from 'react';

export default function useTimedToast(duration = 3500) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => (
    () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  ), []);

  const showToast = (msg, type = 'success') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ msg, type });
    timeoutRef.current = setTimeout(() => setToast(null), duration);
  };

  const clearToast = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast(null);
  };

  return { toast, showToast, clearToast };
}
