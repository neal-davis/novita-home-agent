"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

/**
 * Note the z-index value here
 * It must be greater than the z-index of the header
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[1001] bg-black/50  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    closeable?: boolean;
    overlayClassName?: string;
    overlayStyle?: React.CSSProperties;
  }
>(
  (
    {
      className,
      closeable = true,
      overlayClassName,
      overlayStyle,
      children,
      ...props
    },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} style={overlayStyle} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-[1001] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        {...props}
      >
        {children}
        {closeable && (
          <DialogPrimitive.Close className="absolute right-6 top-6 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-[var(--gray-1)] focus:bg-[var(--gray-1)] disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div>
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left pb-4",
        className,
      )}
      {...props}
    ></div>
  </div>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-h6 leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/**
 * @prop defaultHeight
 *
 * If the content is too long, you can set the "defaultHeight" prop to true
 * when defaultHeight is true, the content will have a max-height of 60vh and overflow-y: auto
 * otherwise, you can set the height by yourself
 */
const DialogContentInner = ({
  className,
  defaultHeight,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { defaultHeight?: boolean }) => (
  <div
    className={cn(
      className,
      defaultHeight ? "max-h-[60vh] overflow-y-auto" : "",
    )}
    {...props}
  />
);
DialogContentInner.displayName = "DialogContentInner";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogContentInner,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
