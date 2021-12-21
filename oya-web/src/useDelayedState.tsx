import { useEffect, useState } from 'react';

export default function useDelayedState<T>(initial: T, { timeout = 500 } = {}) {
  const [state, setState] = useState(initial);
  const [delayedState, setDelayedState] = useState(initial);

  useEffect(() => {
    const id = setTimeout(() => {
      setDelayedState(state);
    }, timeout);
    return () => {
      clearTimeout(id);
    };
  }, [state, timeout]);

  return [state, setState, delayedState, setDelayedState] as const;
}
