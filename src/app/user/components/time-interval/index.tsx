import { useCallback, useEffect, useRef, useState } from "react";

export function TimeInterval({
  children,
  max = 60,
  onClick,
  immediate,
}: {
  children: React.ReactNode;
  max?: number;
  onClick?: () => Promise<any> | void;
  immediate?: boolean;
}) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [time, setTime] = useState(0);

  const timeLeft = useCallback(() => {
    setTime(max);
    if (timer.current) {
      clearInterval(timer.current);
    }
    timer.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime - 1 <= 0) {
          clearInterval(timer.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [max]);

  const countDown = useCallback(() => {
    if (time > 0) return;
    if (onClick) {
      onClick();
    }
    timeLeft();
  }, [time, timeLeft, onClick]);

  useEffect(() => {
    if (immediate) {
      timeLeft();
    }
  }, [immediate, timeLeft]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  return <span onClick={countDown}>{time === 0 ? children : `${time}s`}</span>;
}
