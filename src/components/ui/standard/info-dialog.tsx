"use client";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeInfoDialog } from "@/store/slice/configSlice";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
export default function InfoDialog() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { title, description, confirmRedirect, emphasisContent } =
    useAppSelector((state) => state.config.infoDialog);
  const isOpen = useMemo(() => {
    return Boolean(title && description);
  }, [title, description]);
  const showDescription = useCallback((text: string, emphasis?: string) => {
    if (!emphasis) return text;
    const parts = text.split(emphasis);
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="font-bold">{emphasis}</span>
            )}
          </span>
        ))}
      </>
    );
  }, []);
  const handleClose = useCallback(() => {
    dispatch(closeInfoDialog());
    if (confirmRedirect) {
      requestAnimationFrame(() => {
        router.push(confirmRedirect);
      });
    }
  }, [dispatch, confirmRedirect, router]);
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {showDescription(description, emphasisContent)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>{"OK"}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
