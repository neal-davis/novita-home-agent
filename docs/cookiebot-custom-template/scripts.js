window.showCookieBanner = function showCookieBanner() {
  var dialog = document.getElementById("CybotCookiebotDialog");

  if (!dialog) {
    return;
  }

  dialog.removeAttribute("hidden");
  dialog.removeAttribute("aria-hidden");
  dialog.style.display = "";
};

window.hideCookieBanner = function hideCookieBanner() {
  var dialog = document.getElementById("CybotCookiebotDialog");

  if (!dialog) {
    return;
  }

  dialog.setAttribute("aria-hidden", "true");
  dialog.style.display = "none";
};

window.novitaCookiebotToggleDetails = function novitaCookiebotToggleDetails(
  event,
) {
  if (event) {
    event.preventDefault();
  }

  var trigger = event && event.currentTarget;
  var details = document.getElementById("nv-cookiebot-details");

  if (!trigger || !details) {
    return false;
  }

  var isExpanded = trigger.getAttribute("aria-expanded") === "true";
  trigger.setAttribute("aria-expanded", String(!isExpanded));
  details.hidden = isExpanded;

  if (isExpanded) {
    window.novitaCookiebotSetTableOpen(false);
  }

  return false;
};

window.novitaCookiebotSetOptionalConsent =
  function novitaCookiebotSetOptionalConsent(value) {
    [
      "CybotCookiebotDialogBodyLevelButtonPreferences",
      "CybotCookiebotDialogBodyLevelButtonStatistics",
      "CybotCookiebotDialogBodyLevelButtonMarketing",
    ].forEach(function setConsentCheckbox(id) {
      var checkbox = document.getElementById(id);

      if (checkbox) {
        checkbox.checked = value;
      }
    });
  };

window.novitaCookiebotSetTableOpen = function novitaCookiebotSetTableOpen(
  isOpen,
) {
  var dialog = document.getElementById("CybotCookiebotDialog");

  if (!dialog) {
    return;
  }

  if (isOpen) {
    if (dialog.className.indexOf("nv-cookiebot--table-open") === -1) {
      dialog.className += " nv-cookiebot--table-open";
    }
  } else {
    dialog.className = dialog.className
      .replace("nv-cookiebot--table-open", "")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "");
  }
};

window.novitaCookiebotToggleTable = function novitaCookiebotToggleTable(event) {
  var details = event && event.currentTarget && event.currentTarget.parentNode;

  window.setTimeout(function updateCookieTableLayout() {
    window.novitaCookiebotSetTableOpen(Boolean(details && details.open));
  }, 0);

  return true;
};

window.novitaCookiebotDeny = function novitaCookiebotDeny(event) {
  if (event) {
    event.preventDefault();
  }

  window.novitaCookiebotSetOptionalConsent(false);

  if (window.Cookiebot && window.Cookiebot.dialog) {
    window.Cookiebot.dialog.submitDecline();
  }

  return false;
};

window.novitaCookiebotSaveSelection = function novitaCookiebotSaveSelection(
  event,
) {
  if (event) {
    event.preventDefault();
  }

  if (window.Cookiebot && window.Cookiebot.dialog) {
    window.Cookiebot.dialog.submitConsent();
  }

  return false;
};

window.novitaCookiebotAllowAll = function novitaCookiebotAllowAll(event) {
  if (event) {
    event.preventDefault();
  }

  window.novitaCookiebotSetOptionalConsent(true);

  if (window.Cookiebot && window.Cookiebot.dialog) {
    window.Cookiebot.dialog.submitConsent();
  }

  return false;
};
