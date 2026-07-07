"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UnicornSceneProps } from "unicornstudio-react/next";

const UnicornScene = dynamic(() => import("unicornstudio-react/next"), {
  ssr: false,
});

const HERO_POSTER_SRC = "/home/hero/unicon/16-3.png";

/**
 * The poster is requested twice for the same URL: once by the z-0 <Image>
 * below (cache-warmer for the scene) and once by the UnicornStudio SDK, which
 * loads it as a WebGL texture via `new Image()` with `crossOrigin="anonymous"`.
 * HTTP caches key on the request's CORS/credentials mode as well as the URL, so
 * a no-CORS <Image> request and the SDK's anonymous-CORS request are stored as
 * two separate cache entries and never share — the SDK re-downloads the full
 * PNG even though the poster just fetched it. Marking the <Image> request
 * `crossOrigin="anonymous"` aligns the modes so the single cached response is
 * reused. (i18n-disable: technical attribute value, not user-facing copy.)
 */
// i18n-disable-next-line
const HERO_POSTER_CROSS_ORIGIN = "anonymous";

/**
 * The shader stack in `remix-bg.json` (flowField / chromab / beam) is driven by
 * a `uTime` uniform that advances `+= 60 * speed / fps` per rendered frame. At
 * `uTime ≈ 0` the Perlin field sits in its aligned state and then diffuses —
 * that brief "ripple" is the startup transient, not a loading artifact (the
 * poster texture is already cached). The fix is to advance the scene through
 * enough *real* render frames to let the transient settle, then reveal.
 *
 * ~40 frames ≈ uTime advanced by `40 * 60 * 0.21 / 60 ≈ 8.4`, past the visible
 * ripple. We pump these via RAF (one `renderFrame()` per frame) so the work is
 * spread across real frames rather than blocking one long task.
 */
const HERO_SCENE_WARMUP_FRAME_COUNT = 40;

/**
 * Fallback when the running SDK build doesn't expose `renderFrame` on the scene
 * instance — degrade to a wall-clock reveal so the scene still appears.
 */
const HERO_SCENE_FALLBACK_REVEAL_FRAME_COUNT = 8;
const HERO_SCENE_FALLBACK_REVEAL_DELAY_MS = 900;

/**
 * The scene instance type isn't exported by name, so we recover it from the
 * `sceneRef` prop. `React.Ref<T>` includes `RefObject<T>`, whose `current`
 * carries the element type.
 */
type SceneRefProp = NonNullable<UnicornSceneProps["sceneRef"]>;
type UnicornStudioScene = NonNullable<
  Extract<SceneRefProp, { current: unknown }>["current"]
>;

/**
 * Subset of the scene instance we rely on. `renderFrame` is a real prototype
 * method (the SDK calls it every tick to advance `uTime` + draw) but isn't in
 * the published type, so we narrow to it defensively rather than cast to `any`.
 *
 * We drive `renderFrame` ourselves rather than the SDK's `renderNFrames`: the
 * global render loop unconditionally sets `rendering = true` for in-view
 * scenes, and `renderNFrames` short-circuits on `this.rendering`, so its
 * completion callback can silently never fire. `renderFrame` has no such guard.
 */
type WarmableScene = UnicornStudioScene & {
  renderFrame?: () => void;
};

/** Keep the 1512:983 art direction while covering the full hero viewport. */
const sceneCoverFrameStyle = {
  width: "max(100vw, calc(100svh * 1512 / 983))",
  height: "max(100%, calc(100vw * 983 / 1512))",
} as const;

export default function HeroBackground() {
  const [dpi, setDpi] = useState(1);
  const [shouldRenderScene, setShouldRenderScene] = useState(false);
  const [isSceneLoaded, setIsSceneLoaded] = useState(false);
  // Keep the scene paused until warmup completes so the global render loop
  // (which gates on `!paused`) can't advance `uTime` during the transient.
  // Our manual `renderFrame()` pump bypasses `paused`, so warmup still runs.
  const [isScenePaused, setIsScenePaused] = useState(true);
  const sceneRef = useRef<WarmableScene | null>(null);
  const revealRafRef = useRef<number | null>(null);
  const revealDelayRef = useRef<number | null>(null);

  const cancelReveal = useCallback(() => {
    if (revealRafRef.current !== null) {
      window.cancelAnimationFrame(revealRafRef.current);
      revealRafRef.current = null;
    }

    if (revealDelayRef.current !== null) {
      window.clearTimeout(revealDelayRef.current);
      revealDelayRef.current = null;
    }
  }, []);

  useEffect(() => {
    setDpi(Math.min(window.devicePixelRatio ?? 1, 2));
    setShouldRenderScene(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    return () => {
      cancelReveal();
    };
  }, [cancelReveal]);

  const finishReveal = useCallback(() => {
    setIsSceneLoaded(true);
    // Hand the scene back to the global render loop now that it sits on a
    // settled frame.
    setIsScenePaused(false);
  }, []);

  /**
   * Wall-clock fallback used only when the SDK build lacks `renderFrame`.
   * Mirrors the previous behaviour so the scene still reveals.
   */
  const revealViaWallClock = useCallback(() => {
    cancelReveal();
    setIsScenePaused(false);

    let remainingFrames = HERO_SCENE_FALLBACK_REVEAL_FRAME_COUNT;

    const waitForFrame = () => {
      revealRafRef.current = window.requestAnimationFrame(() => {
        remainingFrames -= 1;

        if (remainingFrames > 0) {
          waitForFrame();
          return;
        }

        revealRafRef.current = null;
        revealDelayRef.current = window.setTimeout(() => {
          revealDelayRef.current = null;
          setIsSceneLoaded(true);
        }, HERO_SCENE_FALLBACK_REVEAL_DELAY_MS);
      });
    };

    waitForFrame();
  }, [cancelReveal]);

  const revealScene = useCallback(() => {
    cancelReveal();

    const scene = sceneRef.current;
    if (!scene || typeof scene.renderFrame !== "function") {
      revealViaWallClock();
      return;
    }

    // Pin `paused` synchronously here rather than trusting the wrapper's
    // `paused` effect to win the race against the global render loop's first
    // RAF tick — otherwise the loop could advance `uTime` by a frame mid-warmup.
    scene.paused = true;

    // Frame-accurate path: while the scene is paused (global loop frozen), pump
    // `renderFrame()` ourselves to advance `uTime` past the startup transient,
    // one draw per RAF. Reveal only once warmup is done, so the crossfade lands
    // on an already-settled frame and no ripple is ever exposed.
    let remainingFrames = HERO_SCENE_WARMUP_FRAME_COUNT;

    const pump = () => {
      const current = sceneRef.current;
      if (!current || typeof current.renderFrame !== "function") {
        revealRafRef.current = null;
        finishReveal();
        return;
      }

      current.renderFrame();
      remainingFrames -= 1;

      if (remainingFrames > 0) {
        revealRafRef.current = window.requestAnimationFrame(pump);
        return;
      }

      revealRafRef.current = null;
      finishReveal();
    };

    revealRafRef.current = window.requestAnimationFrame(pump);
  }, [cancelReveal, finishReveal, revealViaWallClock]);

  const hideScene = useCallback(() => {
    cancelReveal();
    setIsSceneLoaded(false);
  }, [cancelReveal]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/*
        Tablet: copy sits in the centered safe area but the bg / WebGL focal point is
        biased right — translate the stack left (with extra width) so the icon aligns
        visually with the hero column. Symmetric width+left keeps center at 50%; translate
        + wider box actually pans the artwork.
      */}
      <div
        className="
          absolute inset-y-0 left-0 h-full w-full
          md:w-[calc(100%+min(14vw,160px))] md:-translate-x-[min(7vw,80px)] md:max-w-none
          lg:w-full lg:translate-x-0 lg:max-w-full
        "
      >
        <div className="absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 isolate -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-[var(--gray-50)]"
            style={sceneCoverFrameStyle}
          >
            <div className="absolute inset-0 z-10 overflow-hidden bg-transparent">
              {shouldRenderScene && (
                <UnicornScene
                  jsonFilePath="/home/hero/remix-bg.json"
                  width="100%"
                  height="100%"
                  scale={1}
                  dpi={dpi}
                  fps={30}
                  // `lazyLoad` makes the wrapper inject the UnicornStudio SDK
                  // script with next/script `strategy="lazyOnload"`, which only
                  // fires after `window.load`. That couples the hero reveal to
                  // every blocking resource on the page — including the Twitter
                  // pixel / GTM marketing scripts at the end of <body>. When one
                  // of those third-party requests "slow-fails" (e.g. t.co is
                  // unreachable and times out rather than 4xx-ing fast),
                  // `window.load` is deferred for the full timeout and the hero
                  // image sits pending the whole time even though it's cached.
                  // `lazyLoad={false}` switches the SDK script to
                  // `afterInteractive` (loads right after hydration), decoupling
                  // the reveal from `window.load` and third-party script health.
                  lazyLoad={false}
                  production={true}
                  paused={isScenePaused}
                  sceneRef={sceneRef}
                  className={[
                    "absolute inset-0 block overflow-hidden transition-opacity duration-500 ease-out",
                    isSceneLoaded ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  showPlaceholderWhileLoading={false}
                  showPlaceholderOnError={false}
                  onLoad={revealScene}
                  onError={hideScene}
                />
              )}
            </div>
            <Image
              src={HERO_POSTER_SRC}
              alt=""
              fill
              priority
              unoptimized
              crossOrigin={HERO_POSTER_CROSS_ORIGIN}
              sizes="100vw"
              className={[
                "absolute inset-0 z-20 object-cover transition-opacity duration-500 ease-out",
                isSceneLoaded ? "opacity-0" : "opacity-100",
              ].join(" ")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
