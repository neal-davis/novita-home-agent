"use client";

import type { CSSProperties, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import styles from "./Modal.module.scss";

type ModalClassNames = {
  header?: string;
  body?: string;
  footer?: string;
  mask?: string;
  wrapper?: string;
  content?: string;
};

type ModalStyles = {
  header?: CSSProperties;
  body?: CSSProperties;
  footer?: CSSProperties;
  mask?: CSSProperties;
  wrapper?: CSSProperties;
  content?: CSSProperties;
};

type NovitaModalProps = {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode | null | false;
  width?: number | string;
  className?: string;
  classNames?: ModalClassNames;
  style?: CSSProperties;
  styles?: ModalStyles;
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  centered?: boolean;
  closeIcon?: ReactNode | null;
  zIndex?: number;
  okText?: ReactNode;
  cancelText?: ReactNode;
  getContainer?: () => HTMLElement;
  onCancel?: () => void;
  onOk?: () => void;
};

function normalizeWidth(width?: number | string) {
  if (typeof width === "number") {
    return `${width}px`;
  }

  return width;
}

function normalizeCssSize(value?: CSSProperties["maxHeight"]) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

function normalizeMaxHeight(
  ...values: Array<CSSProperties["maxHeight"] | undefined>
) {
  let customMaxHeight: CSSProperties["maxHeight"] | undefined;

  values.forEach((value) => {
    if (value !== undefined) {
      customMaxHeight = value;
    }
  });

  const normalizedMaxHeight = normalizeCssSize(customMaxHeight);

  if (normalizedMaxHeight === "none") {
    return "80vh";
  }

  return normalizedMaxHeight ? `min(${normalizedMaxHeight}, 80vh)` : "80vh";
}

export default function Modal({
  open = false,
  title,
  children,
  footer,
  width,
  className,
  classNames,
  style,
  styles: modalStyles,
  closable = true,
  maskClosable = true,
  destroyOnClose,
  centered,
  closeIcon,
  zIndex,
  okText = "OK",
  cancelText = "Cancel",
  getContainer: _getContainer,
  onCancel,
  onOk,
}: NovitaModalProps) {
  const handleOpenChange = (value: boolean) => {
    if (!value) {
      onCancel?.();
    }
  };

  if (destroyOnClose && !open) {
    return null;
  }

  const normalizedWidth = normalizeWidth(width);
  const normalizedMaxHeight = normalizeMaxHeight(
    style?.maxHeight,
    modalStyles?.wrapper?.maxHeight,
    modalStyles?.content?.maxHeight,
  );
  const hasTitle =
    title !== null &&
    title !== false &&
    title !== undefined &&
    !(typeof title === "string" && title.trim() === "");
  const defaultFooter = footer === undefined;
  const showCloseButton = closable && closeIcon !== null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        closeable={showCloseButton}
        overlayClassName={classNames?.mask}
        overlayStyle={modalStyles?.mask}
        className={cn(
          styles.modal_wrapper,
          classNames?.wrapper,
          styles.modal_content,
          classNames?.content,
          "flex flex-col overflow-hidden",
          className,
        )}
        style={{
          maxWidth: normalizedWidth,
          zIndex,
          ...style,
          ...modalStyles?.wrapper,
          ...modalStyles?.content,
          maxHeight: normalizedMaxHeight,
        }}
        onInteractOutside={(event) => {
          if (!maskClosable) {
            event.preventDefault();
          }
        }}
      >
        {showCloseButton && closeIcon ? (
          <button
            type="button"
            aria-label="Close"
            className="absolute right-6 top-6 p-1 opacity-70 transition-opacity hover:opacity-100"
            onClick={onCancel}
          >
            {closeIcon}
          </button>
        ) : null}
        {hasTitle ? (
          <div
            className={cn(styles.modal_header, classNames?.header)}
            style={modalStyles?.header}
          >
            <DialogTitle>{title}</DialogTitle>
          </div>
        ) : (
          <DialogTitle className="sr-only">Dialog</DialogTitle>
        )}
        <div
          className={cn(styles.modal_body, classNames?.body)}
          style={modalStyles?.body}
        >
          {children}
        </div>
        {defaultFooter ? (
          <DialogFooter
            className={cn(styles.modal_footer, classNames?.footer)}
            style={modalStyles?.footer}
          >
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button onClick={onOk}>{okText}</Button>
          </DialogFooter>
        ) : footer ? (
          <DialogFooter
            className={cn(styles.modal_footer, classNames?.footer)}
            style={modalStyles?.footer}
          >
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
