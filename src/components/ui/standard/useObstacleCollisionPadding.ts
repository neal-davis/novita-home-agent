"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

const EDGE_SAMPLE_OFFSET = 1;
const EDGE_ALIGNMENT_TOLERANCE = 2;
const MAX_EDGE_OBSTACLE_HEIGHT_RATIO = 0.5;

export type CollisionPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * Detects fixed/sticky bars intruding from the viewport edges (e.g. a
 * `position: fixed` bottom action bar) and returns a `collisionPadding` for
 * Radix popper content so the dropdown flips/shrinks instead of opening behind
 * them.
 *
 * Radix collision avoidance only knows about the viewport edge — a fixed
 * overlay is not a clipping ancestor, so without this it opens into the space
 * the bar covers. We probe the actual rendered DOM with `elementsFromPoint`,
 * which generically catches any fixed/sticky obstacle without per-page wiring.
 *
 * `elementRef` is the popper content (or trigger) element; its horizontal span
 * is used so we only react to bars that actually sit under the dropdown.
 * `active` should be true while the dropdown is open.
 */
export function useObstacleCollisionPadding(
  elementRef: RefObject<HTMLElement>,
  active: boolean,
  base = 8,
): CollisionPadding {
  const [padding, setPadding] = useState<CollisionPadding>({
    top: base,
    right: base,
    bottom: base,
    left: base,
  });

  useLayoutEffect(() => {
    if (!active) {
      setPadding({ top: base, right: base, bottom: base, left: base });
      return;
    }

    const measure = () => {
      setPadding(detectObstaclePadding(elementRef.current, base));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, base, elementRef]);

  return padding;
}

function detectObstaclePadding(
  element: HTMLElement | null,
  base: number,
): CollisionPadding {
  if (typeof document === "undefined") {
    return { top: base, right: base, bottom: base, left: base };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Sample across the dropdown's horizontal span (fall back to viewport center)
  // so we only react to bars that actually sit under it.
  const rect = element?.getBoundingClientRect();
  const xs = rect
    ? [rect.left, rect.left + rect.width / 2, rect.right]
    : [vw / 2];
  const sampleXs = xs.map((x) => Math.min(Math.max(x, 1), vw - 1));

  let topIntrusion = 0;
  let bottomIntrusion = 0;

  for (const x of sampleXs) {
    const bottomEl = topMostObstacleAt(x, vh - EDGE_SAMPLE_OFFSET, element, {
      edge: "bottom",
      viewportHeight: vh,
    });
    if (bottomEl) {
      bottomIntrusion = Math.max(
        bottomIntrusion,
        vh - bottomEl.getBoundingClientRect().top,
      );
    }

    const topEl = topMostObstacleAt(x, EDGE_SAMPLE_OFFSET, element, {
      edge: "top",
      viewportHeight: vh,
    });
    if (topEl) {
      topIntrusion = Math.max(
        topIntrusion,
        topEl.getBoundingClientRect().bottom,
      );
    }
  }

  return {
    top: base + Math.max(0, topIntrusion),
    right: base,
    bottom: base + Math.max(0, bottomIntrusion),
    left: base,
  };
}

/**
 * Returns the first fixed/sticky element under a point, skipping the dropdown's
 * own popper content (so it never treats itself as an obstacle).
 */
function topMostObstacleAt(
  x: number,
  y: number,
  self: HTMLElement | null,
  options: {
    edge: "top" | "bottom";
    viewportHeight: number;
  },
): HTMLElement | null {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    if (!(el instanceof HTMLElement)) continue;
    if (el.closest("[data-radix-popper-content-wrapper]")) continue;
    if (self && self.contains(el)) continue;

    const position = getComputedStyle(el).position;
    if (
      (position === "fixed" || position === "sticky") &&
      isEdgeObstacle(el.getBoundingClientRect(), options)
    ) {
      return el;
    }
  }
  return null;
}

function isEdgeObstacle(
  rect: DOMRect,
  {
    edge,
    viewportHeight,
  }: {
    edge: "top" | "bottom";
    viewportHeight: number;
  },
): boolean {
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, viewportHeight);
  const visibleHeight = visibleBottom - visibleTop;

  if (visibleHeight <= 0) return false;

  // Full-height fixed layers (overlays, sidebars) are not edge bars and should
  // not make every select think the viewport has no usable space.
  if (visibleHeight >= viewportHeight * MAX_EDGE_OBSTACLE_HEIGHT_RATIO) {
    return false;
  }

  if (edge === "top") {
    return (
      rect.top <= EDGE_ALIGNMENT_TOLERANCE && rect.bottom > EDGE_SAMPLE_OFFSET
    );
  }

  return (
    rect.bottom >= viewportHeight - EDGE_ALIGNMENT_TOLERANCE &&
    rect.top < viewportHeight - EDGE_SAMPLE_OFFSET
  );
}
