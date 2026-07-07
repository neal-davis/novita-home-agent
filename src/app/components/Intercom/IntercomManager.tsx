"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPathnameWithoutLocale } from "@/i18n/config";
import { useCookiebotConsent } from "@/hooks/useCookiebotConsent";
import styles from "./IntercomManager.module.scss";
import "./intercom.scss";

const X = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

const HIDE_INTERCOM_PATHS = [
  "/llm-api/playground",
  // "/gpus-console/serverless-deploy",
];

export default function IntercomManager() {
  const [shouldHideIntercom, setShouldHideIntercom] = useState(false);
  const [showIntercomBtn, setShowIntercomBtn] = useState(false);
  const [launcherLoaded, setLauncherLoaded] = useState(false);

  const path = usePathname();
  const businessPath = getPathnameWithoutLocale(path);
  const consent = useCookiebotConsent();
  const canUseIntercom = consent.preferences || consent.marketing;
  const launcher = useRef<HTMLElement | null>(null);
  const intercomShown = useRef(false);

  const getIntercomLauncher = useCallback(() => {
    const normalLauncher = document.querySelector(
      ".intercom-launcher",
    ) as HTMLElement;
    if (normalLauncher) {
      // The initial lightweight-app will handle click event on capturing,
      // so it will show intercom message dialog when clicking the close button.
      // We need to wrap it and append the close button to the wrapper.
      const wrapper = document.createElement("div");
      wrapper.className = "intercom-launcher-temp-wrapper";
      const parentEl = normalLauncher.parentElement;
      wrapper.appendChild(normalLauncher);
      wrapper.style.right = "-80px";
      parentEl!.appendChild(wrapper);
      return wrapper;
    }

    const iframe = document.querySelector(
      ".intercom-launcher-frame",
    ) as HTMLIFrameElement;
    if (iframe) {
      return iframe?.parentElement as HTMLElement;
    }
    return null;
  }, []);

  const doHideIntercomBtn = useCallback(() => {
    if (!launcher.current) {
      return;
    }
    window.Intercom("hide");
    setShowIntercomBtn(false);
    intercomShown.current = false;
    launcher.current.style.right = "-80px";
  }, []);

  const addCloseBtn = useCallback(() => {
    if (!launcher.current) {
      return;
    }
    const closeBtn = document.createElement("div");
    closeBtn.className = "close-btn";
    closeBtn.innerHTML = X;
    closeBtn.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        doHideIntercomBtn();
      },
      true,
    );
    launcher.current.appendChild(closeBtn);
  }, [doHideIntercomBtn]);

  const detectLauncherRemove = useCallback(() => {
    // Intercom will remove the lightweight-app element and create a new launcher when clicking the launcher button for the first time.
    // We need to detect the removal and assign the new launcher to launcher.current.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (
            node instanceof HTMLElement &&
            node.classList.contains("intercom-lightweight-app")
          ) {
            const newLauncher = getIntercomLauncher();
            if (newLauncher) {
              launcher.current = newLauncher as HTMLElement;
              if (intercomShown.current) {
                newLauncher.style.right = "20px";
              } else {
                newLauncher.style.right = "-80px";
              }
              setTimeout(() => {
                newLauncher.style.transition = "right 0.2s ease-out";
              }, 100);
              addCloseBtn();
            }
          }
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  }, [getIntercomLauncher, addCloseBtn]);

  const doShowIntercomBtn = useCallback(() => {
    if (!launcher.current) {
      return;
    }
    setShowIntercomBtn(true);
    intercomShown.current = true;
    launcher.current.style.right = "20px";
  }, []);

  useEffect(() => {
    setShouldHideIntercom(
      HIDE_INTERCOM_PATHS.some((p) => businessPath.endsWith(p)),
    );
  }, [businessPath]);

  useEffect(() => {
    if (!canUseIntercom) {
      setLauncherLoaded(false);
      setShowIntercomBtn(false);
    }
  }, [canUseIntercom]);

  useEffect(() => {
    if (!canUseIntercom || !shouldHideIntercom) {
      return;
    }

    document.body.classList.add("novita-llm-playground");
    let timeoutId: NodeJS.Timeout;
    let observer: MutationObserver;

    const checkAndSetupIntercom = () => {
      launcher.current = getIntercomLauncher();
      if (launcher.current && window.Intercom) {
        observer = detectLauncherRemove();
        setLauncherLoaded(true);
        doHideIntercomBtn();
        addCloseBtn();
      } else {
        timeoutId = setTimeout(checkAndSetupIntercom, 100);
      }
    };

    checkAndSetupIntercom();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (observer) {
        observer.disconnect();
      }
      document.body.classList.remove("novita-llm-playground");
    };
  }, [
    addCloseBtn,
    canUseIntercom,
    detectLauncherRemove,
    doHideIntercomBtn,
    getIntercomLauncher,
    shouldHideIntercom,
  ]);

  return (
    <>
      {canUseIntercom && shouldHideIntercom && launcherLoaded && (
        <span
          className={`${styles.show_intercom_btn} ${
            showIntercomBtn ? styles.hide : ""
          }`}
          onMouseEnter={() => {
            doShowIntercomBtn();
          }}
        >
          <ChevronLeft />
        </span>
      )}
    </>
  );
}
