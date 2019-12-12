import React, { useEffect, useRef } from "react";

export const useInterval = (callback: Function, delay: number) => {
  const savedCallback: React.MutableRefObject<Function> = useRef<Function>(
    () => {}
  );

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    let intervalID: number;

    if (delay !== 0) {
      intervalID = window.setInterval(tick, delay);
    }
    return () => window.clearInterval(intervalID);
  }, [delay]);
};
