"use client";

import { ConsoleProduct } from "@/types/header";
import { getPathnameWithoutLocale } from "@/i18n/config";

const MAX_STACK_SIZE = 10;
const navigationStack: string[] = [];

export const getNavigationStack = (): string[] => {
  return [...navigationStack];
};

export const pushToStack = (path: string): void => {
  if (navigationStack[navigationStack.length - 1] === path) {
    return;
  }

  navigationStack.push(path);

  if (navigationStack.length > MAX_STACK_SIZE) {
    navigationStack.shift();
  }
};

export const popFromStack = (): string | undefined => {
  return navigationStack.pop();
};

export const getPreviousPath = (): string | undefined => {
  if (navigationStack.length < 2) {
    return undefined;
  }
  return navigationStack[navigationStack.length - 2];
};

export const clearStack = (): void => {
  navigationStack.length = 0;
};

export const getStackLength = (): number => {
  return navigationStack.length;
};

/**
 * Determines which main page section (ConsoleProduct) a given path belongs to
 */
export const getProductFromPath = (path: string): ConsoleProduct => {
  const businessPath = getPathnameWithoutLocale(path);
  if (businessPath.startsWith("/models-console")) {
    return "models";
  }
  if (businessPath.startsWith("/gpus-console")) {
    return "gpus";
  }
  if (businessPath.startsWith("/sandbox-console")) {
    return "sandbox";
  }
  if (businessPath.startsWith("/billing")) {
    return "billing";
  }
  if (businessPath.startsWith("/quota-limits")) {
    return "quota-limits";
  }
  if (businessPath.startsWith("/settings")) {
    return "settings";
  }
  return "main";
};

/**
 * Gets the most recent path from a different main page section than the current one.
 * This is used for the "Back" button to navigate to the previous main page,
 * not just the previous path in history.
 */
export const getPreviousMainPagePath = (
  currentPath: string,
): string | undefined => {
  const currentProduct = getProductFromPath(currentPath);

  // Iterate from the end of the stack (most recent) to find the first path
  // that belongs to a different main page section
  for (let i = navigationStack.length - 1; i >= 0; i--) {
    const path = navigationStack[i];
    const pathProduct = getProductFromPath(path);

    if (pathProduct !== currentProduct) {
      return path;
    }
  }

  return undefined;
};
