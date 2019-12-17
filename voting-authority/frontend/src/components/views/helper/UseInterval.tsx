import React, { useEffect, useRef } from 'react'

export const useInterval = (callback: Function, delay: number): void => {
  const savedCallback: React.MutableRefObject<Function | undefined> = useRef<Function | undefined>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    const tick = (): void => {
      if (savedCallback.current !== undefined) {
        savedCallback.current()
      }
    }

    let intervalID: number

    if (delay !== 0) {
      intervalID = window.setInterval(tick, delay)
    }
    return (): void => window.clearInterval(intervalID)
  }, [delay])
}
