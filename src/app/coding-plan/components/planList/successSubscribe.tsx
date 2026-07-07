"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { NOVITA_URL } from "@/constants/urls";
// import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SuccessSubscribe({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  // const router = useRouter();
  const timer = useRef<any>(null);
  const [count, setCount] = useState(5);
  useEffect(() => {
    timer.current = setInterval(() => {
      setCount((pre) => {
        if (pre <= 0) {
          clearInterval(timer.current);
          setOpen(false);
          return 0;
        }
        return pre - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer.current);
    };
  }, [setOpen]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-h5 text-[var(--dark-1)]"></DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4">
          <img
            src="/coding-plan/success.svg"
            alt="success"
            className="w-12 h-12"
          />
          <h1 className="font-h5 text-[var(--dark-1)]">Purchase completed</h1>
          <div className="font-small-console text-[var(--dark-1)]">
            <span>
              {count}s after automatic close,
              {/* <Button
                variant="link"
                className="font-small-console text-[var(--blue-0)] h-5 p-0"
                onClick={() => router.push(NOVITA_URL.RESOURCE_PACK_MANAGE)}
              >
                {"View purchased coding plans >"}
              </Button> */}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
