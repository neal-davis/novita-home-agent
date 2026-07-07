!(function () {
  function o() {
    return {
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      colorDepth: window.screen.colorDepth,
      onlineStatus: window.navigator.onLine,
      timeZone:
        "object" == typeof Intl && "function" == typeof Intl.DateTimeFormat
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "Unknown",
    };
  }
  function s(e, t) {
    return e.length > t ? e.substring(0, t) : e;
  }
  function a(e, t, n, i, r) {
    (this.error_type = e),
      (this.page = window.location.href),
      (this.context = s(
        JSON.stringify({
          version: window.__MONITOR__.version,
          uniqid: window.__MONITOR__.uniqid,
          initTime: window.__MONITOR__.initTime,
          isPageInBackground: "hidden" === document.visibilityState,
          ...o(),
          ...(window.__MONITOR__.u || {}),
        }),
        1e3,
      )),
      (this.stack = s(r || "", 2e3)),
      (this.message = s((i || "").replace(/[\n :)(']/g, "-"), 1e3)),
      (this.errorno = s(
        t ||
          (function (e, t, n) {
            const i =
              e + "|" + t + "|" + (n || "").replace(/[\n\r\t\s]+/g, " ").trim();
            let r = 0;
            for (let e = 0; e < i.length; e++)
              (r = (r << 5) - r + i.charCodeAt(e)), (r &= r);
            return e + "_" + Math.abs(r).toString(16);
          })(e, n, i),
        1e3,
      )),
      (this.caller = s(n || "", 1e3)),
      window.__MONITOR__.u &&
        window.__MONITOR__.u.user_id &&
        (this.user_id = window.__MONITOR__.u.user_id || -1);
  }
  function n() {
    try {
      var n = "hidden" === document.visibilityState;
      const c = {
        isWhiteScreen: !1,
        reason: "",
        details: {},
        isPageInBackground: n,
      };
      if (n) return (c.reason = "Page is in background"), c;
      if ("complete" !== document.readyState)
        return (
          (c.reason = "Document not fully loaded"),
          (c.details.readyState = document.readyState),
          c
        );
      var i = document.body;
      if (!i)
        return (
          (c.isWhiteScreen = !0), (c.reason = "Document body not found"), c
        );
      if (0 === i.children.length)
        return (
          (c.isWhiteScreen = !0),
          (c.reason = "Body has no children elements"),
          (c.details.bodyChildrenCount = 0),
          c
        );
      var r = ["#root"];
      let e = !1,
        t = "";
      for (var o = 0; o < r.length; o++) {
        var s = r[o],
          a = document.querySelector(s);
        if (a && 0 < a.offsetHeight) {
          (e = !0), (t = s);
          break;
        }
      }
      if (!e)
        return (
          (c.isWhiteScreen = !0),
          (c.reason = "No main content container found or visible"),
          (c.details.checkedSelectors = r),
          c
        );
      (n = window.innerHeight), (i = window.innerWidth);
      const d = document.elementsFromPoint(
        Math.floor(i / 2),
        Math.floor(n / 2),
      );
      if (d.length <= 2)
        return (
          (c.isWhiteScreen = !0),
          (c.reason = "Too few elements visible at viewport center"),
          (c.details.visibleElementsCount = d.length),
          (c.details.visibleElementTags = d.map((e) => e.tagName).join(",")),
          c
        );
      const h = document.querySelector(t),
        l = h.textContent || "";
      if (l.trim().length < 2 && 0 === h.querySelectorAll("img").length)
        return (
          (c.isWhiteScreen = !0),
          (c.reason = "Main content area has insufficient content"),
          (c.details.textLength = l.trim().length),
          (c.details.imageCount = h.querySelectorAll("img").length),
          c
        );
      i = Array.from(document.querySelectorAll("*")).filter((e) => {
        var t = e.getBoundingClientRect();
        return (
          0 < t.width &&
          0 < t.height &&
          "none" !== window.getComputedStyle(e).display
        );
      }).length;
      if (i < 3)
        return (
          (c.isWhiteScreen = !0),
          (c.reason = "Too few visible elements on page"),
          (c.details.visibleContentAreaCount = i),
          c
        );
      n = document.querySelectorAll('.loading, .spinner, [role="progressbar"]');
      return Array.from(n).some((e) => {
        var t = window.getComputedStyle(e);
        return (
          "none" !== t.display &&
          "hidden" !== t.visibility &&
          0 < e.getBoundingClientRect().height
        );
      }) && i < 5
        ? ((c.isWhiteScreen = !0),
          (c.reason = "Page appears stuck in loading state"),
          (c.details.loadingIndicatorsFound = n.length),
          c)
        : c;
    } catch (e) {
      return (
        console.log("[__MONITOR__] Error in white screen check:", e),
        {
          isWhiteScreen: !1,
          reason: "Error occurred during white screen check",
          details: { error: e.message },
        }
      );
    }
  }
  var e, t;
  window.__MONITOR__ ||
    ((window.__MONITOR__ = {
      limit: 200,
      uniqid: (function () {
        var e = localStorage.getItem("__MONITOR_UNIQID__");
        if (e) return e;
        var t = (function () {
          var e = new Date().getTime(),
            t = Math.floor(1e6 * Math.random()),
            n = o();
          const i = n.userAgent + n.screenWidth + n.screenHeight + n.timeZone;
          let r = 0;
          for (let e = 0; e < i.length; e++)
            (r = (r << 5) - r + i.charCodeAt(e)), (r &= r);
          return e + t + Math.abs(r);
        })();
        try {
          localStorage.setItem("__MONITOR_UNIQID__", t);
        } catch (e) {
          console.log(
            "[__MONITOR__] Failed to store uniqid in localStorage:",
            e,
          );
        }
        return t;
      })(),
      initTime: new Date().getTime(),
      u: null,
      q: [],
      user_id: -1,
      version: "",
      isFlushing: !1,
      errs: new Set(),
      resourceErrors: [],
      whiteScreenChecked: !1,
      whiteScreenLoadTimeLimit: 5e3,
      maxWhiteScreenCheckAttempts: 3,
      whiteScreenCheckInterval: 2e3,
      whiteScreenCheckAttempts: 0,
      setU: function (e) {
        this.u = e;
      },
      setVersion: function (e) {
        this.version = e;
      },
      add: function (e) {
        var t;
        ("errorno" in e && this.errs.has(e.errorno)) ||
          ("errorno" in e && e.errorno && this.errs.add(e.errorno),
          (t = () => {
            fetch("https://log-reporter.novita.ai/v1/frontend-log/report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(e),
            }).then(() => {});
          }),
          this.q.length > this.limit && this.q.shift(),
          this.q.push(t),
          this.isFlushing || this.report());
      },
      addResourceError: function (e) {
        this.resourceErrors.push({
          url: e.url || "",
          type: e.tagName || e.type || "unknown",
          time: new Date().getTime(),
        }),
          this.checkForWhiteScreen();
      },
      checkForWhiteScreen: function () {
        this.whiteScreenChecked ||
          (0 === this.whiteScreenCheckAttempts
            ? this.performProgressiveWhiteScreenCheck()
            : setTimeout(() => {
                this.whiteScreenChecked ||
                  this.performProgressiveWhiteScreenCheck();
              }, this.whiteScreenLoadTimeLimit));
      },
      performProgressiveWhiteScreenCheck: function () {
        this.whiteScreenCheckAttempts++;
        var e = this.getPageLoadState(),
          t = n();
        this.shouldReportWhiteScreen(t, e)
          ? ((this.whiteScreenChecked = !0),
            (e = new a(
              "whiteScreenError",
              "",
              window.location.href,
              "White screen detected: " + t.reason,
              JSON.stringify({
                whiteScreenReason: t.reason,
                whiteScreenDetails: t.details,
                loadState: e,
                resourceErrors: this.resourceErrors,
                checkAttempt: this.whiteScreenCheckAttempts,
                timeSinceInit: new Date().getTime() - this.initTime,
              }),
            )),
            this.add(e))
          : this.whiteScreenCheckAttempts < this.maxWhiteScreenCheckAttempts &&
            setTimeout(() => {
              this.whiteScreenChecked ||
                this.performProgressiveWhiteScreenCheck();
            }, this.whiteScreenCheckInterval);
      },
      getPageLoadState: function () {
        return {
          readyState: document.readyState,
          loadEventFired: "complete" === document.readyState,
          pendingResources: this.getPendingResources(),
          visibleContentPercentage: this.calculateVisibleContent(),
          timeElapsed: new Date().getTime() - this.initTime,
        };
      },
      getPendingResources: function () {
        const n = { stylesheets: 0, scripts: 0, images: 0, other: 0 };
        if (window.performance && window.performance.getEntriesByType)
          try {
            const e = window.performance.getEntriesByType("resource"),
              t = e.filter((e) => !e.responseEnd);
            t.forEach((e) => {
              var t = e.initiatorType;
              "link" === t || e.name.endsWith(".css")
                ? n.stylesheets++
                : "script" === t || e.name.endsWith(".js")
                  ? n.scripts++
                  : "img" === t ||
                      /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(e.name)
                    ? n.images++
                    : n.other++;
            });
          } catch (e) {
            console.log("[__MONITOR__] Error getting pending resources:", e);
          }
        return n;
      },
      calculateVisibleContent: function () {
        try {
          var e = document.getElementsByTagName("*").length;
          if (0 === e) return 0;
          var t = Array.from(document.querySelectorAll("*")).filter((e) => {
            var t = e.getBoundingClientRect();
            return (
              0 < t.width &&
              0 < t.height &&
              "none" !== window.getComputedStyle(e).display &&
              "hidden" !== window.getComputedStyle(e).visibility
            );
          }).length;
          return Math.floor((t / e) * 100);
        } catch (e) {
          return -1;
        }
      },
      shouldReportWhiteScreen: function (e, t) {
        return (
          !e.isPageInBackground &&
          (1 === this.whiteScreenCheckAttempts
            ? !(!t.loadEventFired || !e.isWhiteScreen) ||
              (e.isWhiteScreen && "Body has no children elements" === e.reason)
            : 2 === this.whiteScreenCheckAttempts
              ? e.isWhiteScreen &&
                t.timeElapsed > this.whiteScreenLoadTimeLimit &&
                t.visibleContentPercentage < 20
              : e.isWhiteScreen)
        );
      },
      flushReport: function () {
        (this.isFlushing = !1), 0 < this.q.length && this.report();
      },
      report: function () {
        try {
          if (this.isFlushing || 0 === this.q.length) return;
          this.isFlushing = !0;
          const e = this.q.shift();
          "requestIdleCallback" in window
            ? requestIdleCallback(() => {
                e && e(), this.flushReport();
              })
            : "Promise" in window
              ? Promise.resolve().then(() => {
                  e && e(), this.flushReport();
                })
              : setTimeout(() => {
                  e && e(), this.flushReport();
                }, 0);
        } catch (e) {
          console.log("[__MONITOR__]", e), (this.isFlushing = !1);
        }
      },
    }),
    (e = document.querySelector('meta[name="website-hash"]')) && e.content
      ? window.__MONITOR__.setVersion(e.content)
      : window.__MONITOR__.setVersion(new Date().toString()),
    window.addEventListener(
      "error",
      (e) => {
        try {
          if (e.target && e.target !== window) {
            const n = e.target;
            if (
              n.tagName &&
              ["LINK", "SCRIPT", "IMG", "AUDIO", "VIDEO", "IFRAME"].includes(
                n.tagName,
              )
            ) {
              window.__MONITOR__.addResourceError({
                url: n.src || n.href,
                tagName: n.tagName.toLowerCase(),
                type: n.type || n.rel || "",
              });
              var t = new a(
                "resourceError",
                "",
                n.src || n.href || "",
                "Failed to load " + n.tagName.toLowerCase() + " resource",
                "Resource: " + n.src + ", Type: " + (n.type || n.rel || ""),
              );
              return window.__MONITOR__.add(t), !1;
            }
          }
          t = new a(
            "scriptError",
            "",
            (e.filename || "") + ":" + (e.lineno || ""),
            e.message || "",
            e.error ? e.error.stack : "",
          );
          window.__MONITOR__.add(t);
        } catch (e) {
          console.log("[__MONITOR__]", e);
        }
        return !1;
      },
      !0,
    ),
    (window.onerror = function (e, t, n, i, r) {
      try {
        var o = new a("jsError", "", t + ":" + n, e, r ? r.stack : "");
        window.__MONITOR__.add(o);
      } catch (r) {
        console.log("[__MONITOR__]", r);
      }
      return !1;
    }),
    window.addEventListener("unhandledrejection", function (t) {
      try {
        var n,
          i =
            t.reason && t.reason.message ? t.reason.message : String(t.reason);
        const r = t.reason && t.reason.stack ? t.reason.stack : "";
        let e = "";
        !r ||
          (1 < (n = r.split("\n")).length &&
            (n = /at\s+(.+)/.exec(n[1])) &&
            (e = n[1]));
        i = new a("unhandledrejection", "", e, i, r);
        window.__MONITOR__.add(i);
      } catch (e) {
        console.log("[__MONITOR__]", e);
      }
    }),
    (window.__MONITOR__.originalFetch = window.fetch),
    (window.fetch = function () {
      Array.prototype.slice.call(arguments);
      var n = new Date().getTime(),
        i =
          arguments[0] instanceof Request
            ? arguments[0].url
            : String(arguments[0]);
      return window.__MONITOR__.originalFetch
        .apply(this, arguments)
        .then(function (e) {
          var t = new Date().getTime() - n;
          return (
            e.ok ||
              404 === e.status ||
              ((t = new a(
                "networkError",
                "",
                i,
                "HTTP Error: " + e.status + " " + e.statusText,
                "Duration: " + t + "ms\nURL: " + i,
              )),
              window.__MONITOR__.add(t)),
            e
          );
        })
        .catch(function (e) {
          if ("AbortError" === e.name) throw e;
          var t = new Date().getTime() - n,
            t = new a(
              "fetchError",
              "",
              i,
              e.message || "Fetch failed",
              "Duration: " +
                t +
                "ms\nURL: " +
                i +
                "\nStack: " +
                (e.stack || ""),
            );
          throw (window.__MONITOR__.add(t), e);
        });
    }),
    window.addEventListener("load", function () {
      window.__MONITOR__.whiteScreenChecked ||
        setTimeout(() => {
          var e;
          window.__MONITOR__.whiteScreenChecked ||
            ((e = n()).isWhiteScreen &&
              ((window.__MONITOR__.whiteScreenChecked = !0),
              (e = new a(
                "whiteScreenError",
                "",
                window.location.href,
                "White screen detected on page load: " + e.reason,
                JSON.stringify({
                  whiteScreenReason: e.reason,
                  whiteScreenDetails: e.details,
                  loadTime: new Date().getTime() - window.__MONITOR__.initTime,
                  screenSize: window.innerWidth + " x " + window.innerHeight,
                  domState: {
                    bodyChildren: document.body
                      ? document.body.children.length
                      : 0,
                    totalElements: document.getElementsByTagName("*").length,
                    visibleElements: Array.from(
                      document.querySelectorAll("*"),
                    ).filter((e) => {
                      var t = e.getBoundingClientRect();
                      return (
                        0 < t.width &&
                        0 < t.height &&
                        "none" !== window.getComputedStyle(e).display
                      );
                    }).length,
                  },
                  performance: (function () {
                    if (window.performance)
                      try {
                        if (
                          window.performance.getEntriesByType &&
                          0 <
                            window.performance.getEntriesByType("navigation")
                              .length
                        ) {
                          var e =
                            window.performance.getEntriesByType(
                              "navigation",
                            )[0];
                          return {
                            loadEventEnd: e.loadEventEnd,
                            navigationStart: 0,
                            loadTime: e.loadEventEnd,
                            domComplete: e.domComplete,
                            fetchStart: e.fetchStart,
                            responseEnd: e.responseEnd,
                            domContentLoadedEventEnd:
                              e.domContentLoadedEventEnd,
                            type: e.type,
                          };
                        }
                        if (window.performance.timing) {
                          e = window.performance.timing;
                          return {
                            loadEventEnd: e.loadEventEnd,
                            navigationStart: e.navigationStart,
                            loadTime: e.loadEventEnd - e.navigationStart,
                          };
                        }
                      } catch (e) {
                        console.log(
                          "[__MONITOR__] Error getting performance data:",
                          e,
                        );
                      }
                    return null;
                  })(),
                }),
              )),
              window.__MONITOR__.add(e)));
        }, window.__MONITOR__.whiteScreenLoadTimeLimit);
    }),
    document.addEventListener("visibilitychange", function () {
      "visible" === document.visibilityState &&
        !window.__MONITOR__.whiteScreenChecked &&
        0 < window.__MONITOR__.whiteScreenCheckAttempts &&
        setTimeout(() => {
          window.__MONITOR__.whiteScreenChecked ||
            window.__MONITOR__.performProgressiveWhiteScreenCheck();
        }, 1e3);
    }),
    (t = window.__MONITOR__),
    [
      "uniqid",
      "add",
      "report",
      "flushReport",
      "setU",
      "setVersion",
      "originalFetch",
      "addResourceError",
      "checkForWhiteScreen",
    ].forEach((e) => {
      e in t &&
        Object.defineProperty(t, e, {
          value: t[e],
          writable: !1,
          configurable: !1,
        });
    }));
})();
