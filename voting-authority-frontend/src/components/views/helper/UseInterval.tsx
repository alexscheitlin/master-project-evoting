import React, { useEffect, useRef } from 'react';

export const useInterval = (callback: Function, delay: number) => {
  const savedCallback: React.MutableRefObject<Function> = useRef<Function>(() => {});
  let intervalID: number;

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };
    if (delay !== 0) {
      intervalID = setInterval(tick, delay);
    } else {
      return () => clearInterval(intervalID);
    }
  }, [delay]);
};
