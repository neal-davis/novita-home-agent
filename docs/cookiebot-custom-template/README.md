# Cookiebot Custom Template

This folder contains a Novita-styled Cookiebot custom banner template for the
legacy Cookiebot Admin custom template editor.

## Files

- `template.html`: paste into `HTML definition of consent banner`.
- `styles.css`: paste into `Cascading Style Sheets (CSS)`.
- `scripts.js`: paste into the JavaScript editor.
- `preview.html`: local preview with sample text.

## Cookiebot Settings

The current Cookiebot admin is available at:

`https://admin.cookiebot.com/`

Custom banner templates are configured in the legacy Cookiebot admin:

`https://manage.cookiebot.com/en/manage`

Use these settings before switching the banner template to `Custom`:

- Consent method: `Explicit Consent`
- Type: `Inline Multilevel` or `Multilevel`
- Buttons: `Reject all / Selection / Allow all`
- Checkboxes default mode: none pre-checked
- Selection button text: `Save choices` is recommended over `Allow selection`
  for readability in the compact card layout.
- Name of function to show banner: `showCookieBanner`
- Name of function to hide banner: `hideCookieBanner`

Then switch:

`Settings` -> `Banner` -> `Banner template` -> `Custom`

## Privacy Trigger

After a visitor submits consent, Cookiebot can show a small floating button on
the page. Clicking that button opens Cookiebot's `Privacy Trigger` window, where
the visitor can see their current consent state, withdraw consent, or reopen the
banner to change consent.

This window is separate from the custom first-visit banner in this folder. The
`template.html`, `styles.css`, and `scripts.js` files customize the consent
banner, but they do not fully replace the built-in Privacy Trigger window.

Configure the Privacy Trigger in Cookiebot Manager:

`Settings` -> `Privacy trigger`

Common settings:

- Enable or disable the floating trigger.
- Change trigger position and distance from the page edges.
- Choose dark, white, or custom colors.
- Update Privacy Trigger text from Cookiebot content settings.

The trigger can also be overridden per domain from the Cookiebot script:

```html
<script
  id="Cookiebot"
  src="https://consent.cookiebot.com/uc.js"
  data-cbid="..."
  data-widget-enabled="false"
  data-widget-position="bottom-left"
  data-widget-distance-vertical="24"
  data-widget-distance-horizontal="24"
  type="text/javascript"
></script>
```

For Novita, the built-in floating Privacy Trigger is disabled because the site
already provides persistent footer and legal-page entry points for changing
cookie choices. Those custom entry points can call:

```html
<button onclick="Cookiebot.renew()">Change cookie choices</button>
<button onclick="Cookiebot.withdraw()">Withdraw cookie consent</button>
```

## Notes

- The template uses Cookiebot placeholders such as `[#TITLE#]`, `[#TEXT#]`,
  `[#COOKIETYPE_STATISTICS_RAW#]`, and Cookiebot button IDs.
- The CSS is written in a legacy-friendly style for the old Cookiebot Admin
  editor. It intentionally avoids CSS variables, `var()`, CSS Grid, `min()`,
  `position: sticky`, and `backdrop-filter`.
- The visual style follows the project tokens in `src/styles/_design-tokens.scss`,
  with values expanded directly: brand green `#23d57c`, deep green `#16b063`,
  and near-black text.
- The banner is a compact bottom-right card on desktop and becomes a full-width
  bottom card on mobile.
- Keep the `Deny`, `Selection`, and `Allow all` buttons visible and equally easy
  to reach.
