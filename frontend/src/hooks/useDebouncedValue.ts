import { useEffect, useState } from "react";

const useDebouncedValue = <TValue>(value: TValue, delayMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, value]);

  return debouncedValue;
};

export { useDebouncedValue };
