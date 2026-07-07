(function () {
  const STORAGE_KEYS = [
    "source",
    "utm_id",
    "utm_campaign",
    "utm_medium",
    "ref",
    "collect",
    "user_agent",
    "redirect", // affect login redirect page
    "invited_code", // affect register logic, send voucher
    "utm_adgroup",
    "utm_content",
    "utm_term",
    "utm_source",
    "landingpage",
  ];

  const DEFAULT_STORAGE_VALUES = {
    landingpage:
      typeof window !== "undefined" ? "unknown_" + window.location.href : "",
  };

  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function extractDomain(referrer) {
    referrer = referrer.replace("https://", "");
    referrer = referrer.replace("http://", "");
    referrer = referrer.replace("www.", "");
    const domain = referrer.split("/")[0];
    return domain || referrer;
  }

  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    const domain = extractDomain(window.location.origin);
    const ignoreParams = ["login", "code", "token"];
    const overrideParams = ["ref"];
    const paramMap = new Map();

    try {
      if (referrer && !referrer.includes(window.location.host)) {
        localStorage.setItem("referrer", extractDomain(referrer));
      }

      urlParams.forEach((value, key) => {
        const decodedKey = decodeURIComponent(key);
        const decodedValue = decodeURIComponent(value);

        if (!ignoreParams.includes(decodedKey)) {
          if (overrideParams.includes(decodedKey)) {
            localStorage.setItem(decodedKey, decodedValue);
          } else if (!localStorage.getItem(decodedKey)) {
            localStorage.setItem(decodedKey, decodedValue);
          }

          if (!paramMap.has(decodedKey)) {
            paramMap.set(decodedKey, decodedValue);
          }
        }

        // Handle utm_campaign parameter, set cookie with expiration support
        if (decodedKey === "utm_campaign") {
          const campaignParts = decodedValue.split("_");
          const days =
            campaignParts.length > 1 && !isNaN(Number(campaignParts.slice(-1)))
              ? Number(campaignParts.slice(-1))
              : 1;
          setCookie("utm_campaign", decodedValue, days);
        }
      });

      const landingpage = localStorage.getItem("landingpage");
      const landingpageFromCookie = getCookie("landingpage"); // https://blogs.novita.ai/
      if (!landingpage) {
        if (landingpageFromCookie) {
          try {
            localStorage.setItem(
              "landingpage",
              decodeURIComponent(landingpageFromCookie),
            );
          } catch (error) {
            localStorage.setItem("landingpage", landingpageFromCookie);
          }
        } else {
          localStorage.setItem("landingpage", window.location.href);
        }
      }

      if (
        !localStorage.getItem("source") ||
        localStorage.getItem("source") === "Direct"
      ) {
        let source = paramMap.get("utm_source");
        if (!source && referrer) {
          source = extractDomain(referrer);
        }
        if (!source) {
          source = paramMap.get("ref");
        }
        if (!source || source.includes(domain)) {
          source = "Direct";
        }
        if (source) {
          localStorage.setItem("source", source);
        }
      }

      STORAGE_KEYS.forEach((key) => {
        const value = localStorage.getItem(key) || DEFAULT_STORAGE_VALUES[key];
        if (value) {
          setCookie(key, value);
        }
      });
    } catch (error) {
      console.error("collect error", error);
    }
  }
})();
