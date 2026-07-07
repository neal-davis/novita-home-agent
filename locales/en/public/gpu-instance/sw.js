if (!self.define) {
  let e,
    a = {};
  const i = (i, c) => (
    (i = new URL(i + ".js", c).href),
    a[i] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = i), (e.onload = a), document.head.appendChild(e));
        } else ((e = i), importScripts(i), a());
      }).then(() => {
        let e = a[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, s) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (a[n]) return;
    let r = {};
    const d = (e) => i(e, n),
      b = { module: { uri: n }, exports: r, require: d };
    a[n] = Promise.all(c.map((e) => b[e] || d(e))).then((e) => (s(...e), r));
  };
}
define(["./workbox-07a7b4f2"], function (e) {
  "use strict";
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: "/404.png", revision: "88f6e683896bef1f75ccdebf1236c1f3" },
        { url: "/USDT.png", revision: "f3440848924eaad14a8e80af70c84680" },
        { url: "/Video.png", revision: "6b2039d4ee3a7dd4ec142b262984985d" },
        {
          url: "/_next/app-build-manifest.json",
          revision: "d0bff04e8a494ac1656a06d06ffc627f",
        },
        {
          url: "/_next/static/WrRZiBOhMSSh2tl3bIFa1/_buildManifest.js",
          revision: "f127db338159b9e33eab68ed58a7a749",
        },
        {
          url: "/_next/static/WrRZiBOhMSSh2tl3bIFa1/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/1032-fd0c67145d90689b.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/1037-19bddf8c201b5362.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/1100.734ebb58dc087787.js",
          revision: "734ebb58dc087787",
        },
        {
          url: "/_next/static/chunks/1163-d8cbd2accce04aed.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/1213.52ed4a07b8d2388e.js",
          revision: "52ed4a07b8d2388e",
        },
        {
          url: "/_next/static/chunks/1302.1443ace4f3b05b35.js",
          revision: "1443ace4f3b05b35",
        },
        {
          url: "/_next/static/chunks/1392-a4725e7c263d51b2.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/1485-3ac6f53ab9b542f5.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/1502.b7d39a775e7e21d2.js",
          revision: "b7d39a775e7e21d2",
        },
        {
          url: "/_next/static/chunks/1633.94e3d41edab55616.js",
          revision: "94e3d41edab55616",
        },
        {
          url: "/_next/static/chunks/173.7072b8f4c6244807.js",
          revision: "7072b8f4c6244807",
        },
        {
          url: "/_next/static/chunks/1777.66bbb895c8094811.js",
          revision: "66bbb895c8094811",
        },
        {
          url: "/_next/static/chunks/1803.46a542421edea399.js",
          revision: "46a542421edea399",
        },
        {
          url: "/_next/static/chunks/1836.3d12e9e32ef587b8.js",
          revision: "3d12e9e32ef587b8",
        },
        {
          url: "/_next/static/chunks/1903-f8248646ac1353fc.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/1975-5516b72910b0cfad.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/1980.77da75fcb5e9ff89.js",
          revision: "77da75fcb5e9ff89",
        },
        {
          url: "/_next/static/chunks/2010.2ff4be6ba0ff7b31.js",
          revision: "2ff4be6ba0ff7b31",
        },
        {
          url: "/_next/static/chunks/2015.a5bfc773982d0606.js",
          revision: "a5bfc773982d0606",
        },
        {
          url: "/_next/static/chunks/2047.9ae60869cedcb850.js",
          revision: "9ae60869cedcb850",
        },
        {
          url: "/_next/static/chunks/2168.39b7c4b97337c3a9.js",
          revision: "39b7c4b97337c3a9",
        },
        {
          url: "/_next/static/chunks/2281.02f67d7680408a11.js",
          revision: "02f67d7680408a11",
        },
        {
          url: "/_next/static/chunks/2316-2379ae18e13699ce.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/2472-0909825808ab0e3d.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/2615.fedc57553650f6e3.js",
          revision: "fedc57553650f6e3",
        },
        {
          url: "/_next/static/chunks/267.cdd6f3add0fd8501.js",
          revision: "cdd6f3add0fd8501",
        },
        {
          url: "/_next/static/chunks/2725.3c41abb119b1f307.js",
          revision: "3c41abb119b1f307",
        },
        {
          url: "/_next/static/chunks/2833.5a4e047a5800d8f2.js",
          revision: "5a4e047a5800d8f2",
        },
        {
          url: "/_next/static/chunks/2882.e212b865d1965df2.js",
          revision: "e212b865d1965df2",
        },
        {
          url: "/_next/static/chunks/3071-801110455e861d78.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/3107.d1ae6fcf8e90b409.js",
          revision: "d1ae6fcf8e90b409",
        },
        {
          url: "/_next/static/chunks/3202-4c1263e1f74be2b0.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/3255.7cadbee4b27672eb.js",
          revision: "7cadbee4b27672eb",
        },
        {
          url: "/_next/static/chunks/340.ad02309c018f702a.js",
          revision: "ad02309c018f702a",
        },
        {
          url: "/_next/static/chunks/3453.1327d365e3c58e8f.js",
          revision: "1327d365e3c58e8f",
        },
        {
          url: "/_next/static/chunks/3463-674b0a3ca87b387d.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/3514.4552292c21ac24d8.js",
          revision: "4552292c21ac24d8",
        },
        {
          url: "/_next/static/chunks/3589.19f5b1d5db0b1254.js",
          revision: "19f5b1d5db0b1254",
        },
        {
          url: "/_next/static/chunks/3600.8b8873bd35b7081d.js",
          revision: "8b8873bd35b7081d",
        },
        {
          url: "/_next/static/chunks/363642f4-93fdac2eae94f97f.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/3697-420e2d01af63441d.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/3742.cf903fd6ef7be9ac.js",
          revision: "cf903fd6ef7be9ac",
        },
        {
          url: "/_next/static/chunks/3877.43c8be6fa6cef14d.js",
          revision: "43c8be6fa6cef14d",
        },
        {
          url: "/_next/static/chunks/4063.735bcea971285fcc.js",
          revision: "735bcea971285fcc",
        },
        {
          url: "/_next/static/chunks/4116.b3f0a52a4f6711b0.js",
          revision: "b3f0a52a4f6711b0",
        },
        {
          url: "/_next/static/chunks/4118.0ad0ee62a54d29bf.js",
          revision: "0ad0ee62a54d29bf",
        },
        {
          url: "/_next/static/chunks/4196.31671f918e73d27e.js",
          revision: "31671f918e73d27e",
        },
        {
          url: "/_next/static/chunks/4284.68ad5bd4204f503e.js",
          revision: "68ad5bd4204f503e",
        },
        {
          url: "/_next/static/chunks/4441-8747b6a449c4a2e7.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/4476-cfcc54fa081c466e.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/4566.1ad7f9ee864eb419.js",
          revision: "1ad7f9ee864eb419",
        },
        {
          url: "/_next/static/chunks/4581.1230d079292f3fb1.js",
          revision: "1230d079292f3fb1",
        },
        {
          url: "/_next/static/chunks/4869.1ee36cb2fbc174dc.js",
          revision: "1ee36cb2fbc174dc",
        },
        {
          url: "/_next/static/chunks/4900.1243740eb3be34f6.js",
          revision: "1243740eb3be34f6",
        },
        {
          url: "/_next/static/chunks/4928.6e90093286990495.js",
          revision: "6e90093286990495",
        },
        {
          url: "/_next/static/chunks/4945.6c1c23a53115c323.js",
          revision: "6c1c23a53115c323",
        },
        {
          url: "/_next/static/chunks/4981.6c90e1a1e38e9fc5.js",
          revision: "6c90e1a1e38e9fc5",
        },
        {
          url: "/_next/static/chunks/5009.40b4379873f5518b.js",
          revision: "40b4379873f5518b",
        },
        {
          url: "/_next/static/chunks/5175.d4800cca7f4ede41.js",
          revision: "d4800cca7f4ede41",
        },
        {
          url: "/_next/static/chunks/5192.38921202c779bdfb.js",
          revision: "38921202c779bdfb",
        },
        {
          url: "/_next/static/chunks/5202-e0246576679704fa.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/5227.428bf636ac41d3f7.js",
          revision: "428bf636ac41d3f7",
        },
        {
          url: "/_next/static/chunks/5230.b5579854c6c17177.js",
          revision: "b5579854c6c17177",
        },
        {
          url: "/_next/static/chunks/5349.e1623bafeef7d1ac.js",
          revision: "e1623bafeef7d1ac",
        },
        {
          url: "/_next/static/chunks/5420.ea52965bb7575ad7.js",
          revision: "ea52965bb7575ad7",
        },
        {
          url: "/_next/static/chunks/5526.04591e3d0f33409e.js",
          revision: "04591e3d0f33409e",
        },
        {
          url: "/_next/static/chunks/5602.61f68a22842cf6b9.js",
          revision: "61f68a22842cf6b9",
        },
        {
          url: "/_next/static/chunks/5608.787d91c22f225ca4.js",
          revision: "787d91c22f225ca4",
        },
        {
          url: "/_next/static/chunks/5643.c8486cab32cba4b8.js",
          revision: "c8486cab32cba4b8",
        },
        {
          url: "/_next/static/chunks/5661.9cd130974fcffd62.js",
          revision: "9cd130974fcffd62",
        },
        {
          url: "/_next/static/chunks/5675.b9c755fb43b11b6c.js",
          revision: "b9c755fb43b11b6c",
        },
        {
          url: "/_next/static/chunks/5691.c9450aba54194c29.js",
          revision: "c9450aba54194c29",
        },
        {
          url: "/_next/static/chunks/5757.3161796fb9940d56.js",
          revision: "3161796fb9940d56",
        },
        {
          url: "/_next/static/chunks/5825.cc97995789af8966.js",
          revision: "cc97995789af8966",
        },
        {
          url: "/_next/static/chunks/6076.64b1baddc1be4893.js",
          revision: "64b1baddc1be4893",
        },
        {
          url: "/_next/static/chunks/6118.35baa87dd6d3c9c2.js",
          revision: "35baa87dd6d3c9c2",
        },
        {
          url: "/_next/static/chunks/6143.fb11465c652df6bb.js",
          revision: "fb11465c652df6bb",
        },
        {
          url: "/_next/static/chunks/6177.d8860301306c9086.js",
          revision: "d8860301306c9086",
        },
        {
          url: "/_next/static/chunks/6178.b4399056e82e95d5.js",
          revision: "b4399056e82e95d5",
        },
        {
          url: "/_next/static/chunks/6194.e60f949b53bce6c5.js",
          revision: "e60f949b53bce6c5",
        },
        {
          url: "/_next/static/chunks/6274.f6691639eda85eed.js",
          revision: "f6691639eda85eed",
        },
        {
          url: "/_next/static/chunks/6277.3075f71997a31bbe.js",
          revision: "3075f71997a31bbe",
        },
        {
          url: "/_next/static/chunks/6426.1478ef60446e5424.js",
          revision: "1478ef60446e5424",
        },
        {
          url: "/_next/static/chunks/6527-62d273d04d8fda7e.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/6618.001afd860f3175e9.js",
          revision: "001afd860f3175e9",
        },
        {
          url: "/_next/static/chunks/670.f929903040660bf2.js",
          revision: "f929903040660bf2",
        },
        {
          url: "/_next/static/chunks/6719-b593520448600afc.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/6736.f4eb40e76cc6a047.js",
          revision: "f4eb40e76cc6a047",
        },
        {
          url: "/_next/static/chunks/6773.fe19fbdeb10a8750.js",
          revision: "fe19fbdeb10a8750",
        },
        {
          url: "/_next/static/chunks/681-4631ba26d605964e.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/6865.d95d336ea9937fbf.js",
          revision: "d95d336ea9937fbf",
        },
        {
          url: "/_next/static/chunks/6947-b9c6c789e222c935.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/6977.bba0369bd28fc9a0.js",
          revision: "bba0369bd28fc9a0",
        },
        {
          url: "/_next/static/chunks/7024.522cab33e5254010.js",
          revision: "522cab33e5254010",
        },
        {
          url: "/_next/static/chunks/7048.300f376e6d38ad06.js",
          revision: "300f376e6d38ad06",
        },
        {
          url: "/_next/static/chunks/7081.1f77d781165a6f8a.js",
          revision: "1f77d781165a6f8a",
        },
        {
          url: "/_next/static/chunks/7124.18ab837c913fce4e.js",
          revision: "18ab837c913fce4e",
        },
        {
          url: "/_next/static/chunks/7133.895bf5010540ac31.js",
          revision: "895bf5010540ac31",
        },
        {
          url: "/_next/static/chunks/7162.1e0563b84b8a3eee.js",
          revision: "1e0563b84b8a3eee",
        },
        {
          url: "/_next/static/chunks/7176.79f6913e5914bb4b.js",
          revision: "79f6913e5914bb4b",
        },
        {
          url: "/_next/static/chunks/7318.173a76053094ed24.js",
          revision: "173a76053094ed24",
        },
        {
          url: "/_next/static/chunks/7592-8a828ec4ed79a9d8.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/7617.7d3dce6843efc3c1.js",
          revision: "7d3dce6843efc3c1",
        },
        {
          url: "/_next/static/chunks/7649-6bf2c5a721371728.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/7654-548cd44c111ffac6.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/7717.b295e24a2b30f9c8.js",
          revision: "b295e24a2b30f9c8",
        },
        {
          url: "/_next/static/chunks/7795-3ea20fd9e32679ea.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/7875.148e192ea2e9c123.js",
          revision: "148e192ea2e9c123",
        },
        {
          url: "/_next/static/chunks/792.f5efdaab88f600a8.js",
          revision: "f5efdaab88f600a8",
        },
        {
          url: "/_next/static/chunks/795.7ea5ee2330acd8c4.js",
          revision: "7ea5ee2330acd8c4",
        },
        {
          url: "/_next/static/chunks/8135.49769a4e3c291951.js",
          revision: "49769a4e3c291951",
        },
        {
          url: "/_next/static/chunks/8141.2da4d32e3e3dd025.js",
          revision: "2da4d32e3e3dd025",
        },
        {
          url: "/_next/static/chunks/8170-e61386abb05eb24f.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/8216.dc0d48f006b0c7c5.js",
          revision: "dc0d48f006b0c7c5",
        },
        {
          url: "/_next/static/chunks/8259.4e2a45fe6d356ef2.js",
          revision: "4e2a45fe6d356ef2",
        },
        {
          url: "/_next/static/chunks/8304.2ec7b124d3f0aa8e.js",
          revision: "2ec7b124d3f0aa8e",
        },
        {
          url: "/_next/static/chunks/836.efbac09b93c4af4c.js",
          revision: "efbac09b93c4af4c",
        },
        {
          url: "/_next/static/chunks/8422.f7b2dda22d0a23ae.js",
          revision: "f7b2dda22d0a23ae",
        },
        {
          url: "/_next/static/chunks/8437.cd7323e6acdcab1c.js",
          revision: "cd7323e6acdcab1c",
        },
        {
          url: "/_next/static/chunks/8456-b17d21e9f4c913af.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/8521.831004c70be94bf6.js",
          revision: "831004c70be94bf6",
        },
        {
          url: "/_next/static/chunks/8717.7ed7546bbb809e16.js",
          revision: "7ed7546bbb809e16",
        },
        {
          url: "/_next/static/chunks/8780.11a8e9a5e933f941.js",
          revision: "11a8e9a5e933f941",
        },
        {
          url: "/_next/static/chunks/8823.78fe6c58f2faa2a5.js",
          revision: "78fe6c58f2faa2a5",
        },
        {
          url: "/_next/static/chunks/8926.7fa72c03954c6c5b.js",
          revision: "7fa72c03954c6c5b",
        },
        {
          url: "/_next/static/chunks/8949.013ee1c0738e4eaa.js",
          revision: "013ee1c0738e4eaa",
        },
        {
          url: "/_next/static/chunks/8991-52a37ad1629bf3e1.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/9023.bc7268e828462f74.js",
          revision: "bc7268e828462f74",
        },
        {
          url: "/_next/static/chunks/9050-b9ff91e2fbd43aaf.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/910.bdf8204568d07157.js",
          revision: "bdf8204568d07157",
        },
        {
          url: "/_next/static/chunks/9121.611a04b3fac0a36b.js",
          revision: "611a04b3fac0a36b",
        },
        {
          url: "/_next/static/chunks/9299.2976fe175457085e.js",
          revision: "2976fe175457085e",
        },
        {
          url: "/_next/static/chunks/9362.c65a5d0981f38f31.js",
          revision: "c65a5d0981f38f31",
        },
        {
          url: "/_next/static/chunks/9374.5969cb8f0189b3f7.js",
          revision: "5969cb8f0189b3f7",
        },
        {
          url: "/_next/static/chunks/9446.0b5c340b23df2bca.js",
          revision: "0b5c340b23df2bca",
        },
        {
          url: "/_next/static/chunks/9504.c7b72889661b934b.js",
          revision: "c7b72889661b934b",
        },
        {
          url: "/_next/static/chunks/9515.0039c56fbee3eba3.js",
          revision: "0039c56fbee3eba3",
        },
        {
          url: "/_next/static/chunks/9518.f7f01e15d4aa4c2e.js",
          revision: "f7f01e15d4aa4c2e",
        },
        {
          url: "/_next/static/chunks/9596.ed918e12a3d3fa90.js",
          revision: "ed918e12a3d3fa90",
        },
        {
          url: "/_next/static/chunks/975-f490a87c17deeadc.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/9886.1af026ebc2322918.js",
          revision: "1af026ebc2322918",
        },
        {
          url: "/_next/static/chunks/993.eb4eccb1281a67a9.js",
          revision: "eb4eccb1281a67a9",
        },
        {
          url: "/_next/static/chunks/9937.4074dd09ebf35eac.js",
          revision: "4074dd09ebf35eac",
        },
        {
          url: "/_next/static/chunks/app/console/billing/page-c5537f78821525a9.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/console/explore/page-2b7ad75f9178b088.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/console/instances/page-e920551343e0e6c2.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/console/layout-f8294dc4de8be220.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/console/page-5513bb46bbc0d74e.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/console/settings/page-57c5b89138b0d177.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/console/storage/page-714b6a3613aea423.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/console/templates/page-c01870d18ade2aa5.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/contact/page-0b3ce80f19267ee0.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/emailConfirm/page-5cbcc3d309aeafcc.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/emailWait/page-a16ebe461afb75b3.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/forgotPassword/page-58473e6e783fdbc6.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/layout-b768f84649bc75a8.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/login/layout-dc0735a6f123fa91.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/login/page-18d55006f49552c8.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/not-found-72a303db6deaab4d.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/page-c4c28dd7a7c65c25.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/pricing/page-17971d735b952820.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/savingsPlans/page-ca8249f363f1aa4a.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/app/signup/page-50eafba9a8e8fbb4.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/dc112a36-a26ec11f6dfc39b0.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/fd9d1056-0c7d046a8a362b69.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/framework-4498e84bb0ba1830.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/main-3b12749344e078ee.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/main-app-70ddfa31dfc7833b.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/pages/_app-0a6f9986ee298e67.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/pages/_error-77acd5d276fadc61.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-a4f32ec9759cc837.js",
          revision: "WrRZiBOhMSSh2tl3bIFa1",
        },
        {
          url: "/_next/static/css/064392179ab48079.css",
          revision: "064392179ab48079",
        },
        {
          url: "/_next/static/css/1cfda4bca95f33f7.css",
          revision: "1cfda4bca95f33f7",
        },
        {
          url: "/_next/static/css/24652dce03fad8d4.css",
          revision: "24652dce03fad8d4",
        },
        {
          url: "/_next/static/css/497150f1ef94f873.css",
          revision: "497150f1ef94f873",
        },
        {
          url: "/_next/static/css/4e669762862b14e9.css",
          revision: "4e669762862b14e9",
        },
        {
          url: "/_next/static/css/514cf94b6a02a763.css",
          revision: "514cf94b6a02a763",
        },
        {
          url: "/_next/static/css/54217a4025ae22c4.css",
          revision: "54217a4025ae22c4",
        },
        {
          url: "/_next/static/css/59e2c805921e5e71.css",
          revision: "59e2c805921e5e71",
        },
        {
          url: "/_next/static/css/632603a7bfdd10b7.css",
          revision: "632603a7bfdd10b7",
        },
        {
          url: "/_next/static/css/85baaa83483c7a37.css",
          revision: "85baaa83483c7a37",
        },
        {
          url: "/_next/static/css/8ce862bf3f030a67.css",
          revision: "8ce862bf3f030a67",
        },
        {
          url: "/_next/static/css/8e7b05abc4dee281.css",
          revision: "8e7b05abc4dee281",
        },
        {
          url: "/_next/static/css/920f58fb4a426a9f.css",
          revision: "920f58fb4a426a9f",
        },
        {
          url: "/_next/static/css/9f7ac728e94fa384.css",
          revision: "9f7ac728e94fa384",
        },
        {
          url: "/_next/static/css/a70d8c2c453b5216.css",
          revision: "a70d8c2c453b5216",
        },
        {
          url: "/_next/static/css/b12a75cf856a5411.css",
          revision: "b12a75cf856a5411",
        },
        {
          url: "/_next/static/css/b245eeaa56c5a600.css",
          revision: "b245eeaa56c5a600",
        },
        {
          url: "/_next/static/css/daae5b614680d35c.css",
          revision: "daae5b614680d35c",
        },
        {
          url: "/_next/static/css/de84371e3e7cb547.css",
          revision: "de84371e3e7cb547",
        },
        {
          url: "/_next/static/css/edf8112b509ddc9d.css",
          revision: "edf8112b509ddc9d",
        },
        {
          url: "/_next/static/css/f5f096be28f2ad58.css",
          revision: "f5f096be28f2ad58",
        },
        {
          url: "/_next/static/css/f92c11c382dd0493.css",
          revision: "f92c11c382dd0493",
        },
        {
          url: "/_next/static/css/fe2d9d346b97aa93.css",
          revision: "fe2d9d346b97aa93",
        },
        {
          url: "/advantage/10000+models_2x.png",
          revision: "c28371ccca0aeda1f4bdd7dac59dc39a",
        },
        {
          url: "/advantage/cheap.png",
          revision: "b8f204433da1f028f394c50c0df27902",
        },
        {
          url: "/advantage/cheap_2x.png",
          revision: "e4ccef3af5955ac895c63992d4df982b",
        },
        {
          url: "/advantage/fast.png",
          revision: "55f72d795554f6369e2e3a9a642bf011",
        },
        {
          url: "/advantage/fast_2x.png",
          revision: "22020b281765c0ef04de5e053bce66c1",
        },
        {
          url: "/advantage/models.png",
          revision: "a6fb803a253770bc8bf68e6c31736515",
        },
        {
          url: "/billing/balance.png",
          revision: "c3a09f0a7661da303ff63b420caf1c64",
        },
        {
          url: "/billing/icon-addCard.png",
          revision: "0537812b96816b1815f110c1981664aa",
        },
        {
          url: "/billing/icon-dollar.png",
          revision: "26acca2e57d169843814813ac6ae8475",
        },
        {
          url: "/billing/icon-dollar.svg",
          revision: "4b1e32d7f4d2bbfc3c641e43a79ba704",
        },
        {
          url: "/billing/icon-download.png",
          revision: "e485a528914c12da6b70f3902fe24b97",
        },
        {
          url: "/billing/icon-download.svg",
          revision: "33afe71cff219bdfe87f422c03ed27af",
        },
        {
          url: "/billing/icon-recent.png",
          revision: "739464dcb2cee10fe185f2aa4fe65c56",
        },
        {
          url: "/billing/icon-recent.svg",
          revision: "38f2c558fd7d9de0a6a9a6765f732169",
        },
        { url: "/case/1@2x.png", revision: "7fb21cacaa84336d98ed2cc283bff3d4" },
        { url: "/case/2@2x.png", revision: "2dfacb3511d0f396a8c1d25cd1251294" },
        { url: "/case/4@2x.png", revision: "695b130cea77a749f834a3aba1cd8a33" },
        { url: "/case/5@2x.png", revision: "31f13e841b7d45ed1d8239dc5fdbb11c" },
        { url: "/case/6@2x.png", revision: "e7a5e4a95272f9df9c562438910d145f" },
        { url: "/case/7@2x.png", revision: "b84e5f409cf6a7f2219fdbd313d387b5" },
        { url: "/check.png", revision: "71c7ef87855ddc9d6ac1c954c73c631e" },
        { url: "/collect.js", revision: "d475547217ca7ff94fc285017f56ba24" },
        {
          url: "/console/images/img_0.png",
          revision: "b20ea2e5418cd6b3cb73f65fa6d514ab",
        },
        {
          url: "/console/images/img_1.png",
          revision: "7b6c9612560b885697694a34399799b8",
        },
        {
          url: "/console/images/img_2.png",
          revision: "41f25561d8acb9fae38a9e7f5b7e6ea8",
        },
        {
          url: "/contact/arrow.svg",
          revision: "99cba3b28fe5838e595625f4921869d7",
        },
        {
          url: "/contact/border.svg",
          revision: "a61979bfb90719c7c0e0fe1129db5109",
        },
        {
          url: "/contact/close.svg",
          revision: "07b96dff5e2d71937d0d7aaa0be2a993",
        },
        {
          url: "/contact/discord.svg",
          revision: "833467cc35be7ef1ca5bbbb2c21cf693",
        },
        {
          url: "/contact/email.svg",
          revision: "a2e16ebfc269121b3f6e1f0ebd1ac0ce",
        },
        { url: "/contact/x.svg", revision: "40aeff00e3c0d30c7ad12b0ea59f8d9e" },
        {
          url: "/dashboard/ling.svg",
          revision: "e0ac45a4f93fdd069062aebc7c3975f1",
        },
        {
          url: "/dashboard/logo_1.png",
          revision: "9369e961108e356df490e74c36040bf6",
        },
        {
          url: "/dashboard/logo_2.png",
          revision: "ff121c8553d1d099058e37db20895e24",
        },
        {
          url: "/dashboard/logo_3.png",
          revision: "469c5a832410e27eb248c984d6b95e8b",
        },
        {
          url: "/explore/icon-readmeDetail.svg",
          revision: "96d05f290e8102f15bc87482b39aee99",
        },
        {
          url: "/explore/icon-welcomebg.png",
          revision: "9930579b8c38a28bb7844f5ac3caf5ce",
        },
        {
          url: "/explore/icon-welcomebg1.png",
          revision: "3a57610be161daf2ad35635790d728f8",
        },
        { url: "/favicon.ico", revision: "02fc942cc08cb5a9c5b77a44de257387" },
        { url: "/favicon1.ico", revision: "8ac121ffd89da719465bf495ff21d0ea" },
        { url: "/favicon2.ico", revision: "ef0a16b86639d0ca26398c6763e18d67" },
        { url: "/favicon3.ico", revision: "20ef59cccbe8b1d2c82dc5b5acc59f9a" },
        { url: "/faviconwt.ico", revision: "a893cf0d8cdabb76edbc48072b665996" },
        {
          url: "/fonts/BeirutText_Variable_Italic_Web_Trial.woff",
          revision: "788ef16668e39b59aec39b8dc5e82ce9",
        },
        {
          url: "/fonts/BeirutText_Variable_Italic_Web_Trial.woff2",
          revision: "94c80b566b018c60a4e2c73e38b27fe3",
        },
        {
          url: "/fonts/BeirutText_Variable_Upright_Web_Trial.woff",
          revision: "51f10717a0e06c5d357ec37892402776",
        },
        {
          url: "/fonts/BeirutText_Variable_Upright_Web_Trial.woff2",
          revision: "a1dbf2ad2051420c770165233e5c89a9",
        },
        {
          url: "/fonts/HelveticaNeue_Bold.ttf",
          revision: "b8edca3e45f1f16bc6e20464bd8f2fff",
        },
        {
          url: "/fonts/HelveticaNeue_Light.otf",
          revision: "35321a782a3cbb7f9cc0353450a7145e",
        },
        {
          url: "/fonts/MessinaSans_Complete_Italic_Variable_Web_Trial.woff",
          revision: "75e8298917e87898d140ef266bc98278",
        },
        {
          url: "/fonts/MessinaSans_Complete_Italic_Variable_Web_Trial.woff2",
          revision: "01d66905ff803be138add1de4cf1fab7",
        },
        {
          url: "/fonts/MessinaSans_Complete_Upright_Variable_Web_Trial.woff",
          revision: "9b19fafd06f48c4cf52fc8d1b58ef20f",
        },
        {
          url: "/fonts/MessinaSans_Complete_Upright_Variable_Web_Trial.woff2",
          revision: "0144862c01c6585047e0ca72ce490414",
        },
        {
          url: "/fonts/MessinaSans_Mono_Variable_Web_Trial.woff",
          revision: "7500b6536fbc58646a20a73935e691c0",
        },
        {
          url: "/fonts/MessinaSans_Mono_Variable_Web_Trial.woff2",
          revision: "5e805bd32cd81335d17194c7843f0a87",
        },
        {
          url: "/fonts/helveticaneue_thin.ttf",
          revision: "78c28465643a20597ce65eee037a7675",
        },
        { url: "/footer/X.svg", revision: "37a12cfff362900c4f6749bf8cc0005d" },
        {
          url: "/footer/discord.png",
          revision: "fd5739e98d87c6e7c175e52afaba0b3f",
        },
        {
          url: "/footer/facebook.png",
          revision: "8c7e780fd0cd26acf45eb67a033854af",
        },
        {
          url: "/footer/instagram.png",
          revision: "959a7101e3cc7302aa692de22bdbd110",
        },
        {
          url: "/footer/telegram.png",
          revision: "d42d8ade389657f13e51804daa8461f8",
        },
        {
          url: "/footer/tiktok.png",
          revision: "308ab2c5cb7d394d7a0ed61447349e1c",
        },
        {
          url: "/footer/twitter.png",
          revision: "137a6014b1b479a2f588a5e9b1c71fcf",
        },
        {
          url: "/footer/youtube.png",
          revision: "fe9039390aa811825f34f4085fdf0407",
        },
        {
          url: "/header/cleanup.png",
          revision: "e2dfb1b56f6c96f33b223df01a5a21ae",
        },
        {
          url: "/header/create-tile.png",
          revision: "5116b570a2aeb1726028867dd3ee7192",
        },
        {
          url: "/header/doodle.png",
          revision: "a181664bc4c8d0311693baf9cefaed23",
        },
        {
          url: "/header/icon-balance.png",
          revision: "c3a09f0a7661da303ff63b420caf1c64",
        },
        {
          url: "/header/icon-docs.png",
          revision: "5f4aa336f616ce06a27c843840610921",
        },
        {
          url: "/header/icon-docs.svg",
          revision: "21242d2336e8848037a5a202df87d157",
        },
        {
          url: "/header/icon-docs2.png",
          revision: "cf6c0c45d82fb6eeb127b27d52b184d9",
        },
        {
          url: "/header/icon-docs2.svg",
          revision: "26db14f4badea44f7c03c799943671e5",
        },
        {
          url: "/header/icon-dropdown.png",
          revision: "b1544381f17bb066b58b1ddc13f3a017",
        },
        {
          url: "/header/icon-voucher.png",
          revision: "ffff31c2c0adedcf748b30993fde8bdc",
        },
        {
          url: "/header/icon-voucher.svg",
          revision: "9dc2bc85cc2db979b1979bfb55efe9e7",
        },
        {
          url: "/header/icon-voucherbk.svg",
          revision: "3fa2ed792702ba5362b56ddd426fa9eb",
        },
        {
          url: "/header/img2img.png",
          revision: "c0149a9f6c66a8a3da1c265ffb0117b8",
        },
        {
          url: "/header/img2vid.png",
          revision: "7c2154c5937b7001e8e2e998dcc60bc7",
        },
        {
          url: "/header/merge-face.png",
          revision: "0c83f9117caef0616755c5e69007f36d",
        },
        {
          url: "/header/mix-pose.png",
          revision: "97c18fc685127824c808c775839f5b8a",
        },
        {
          url: "/header/outpainting.png",
          revision: "d12889166a39ff595884eec38ef9725a",
        },
        {
          url: "/header/remove-background.png",
          revision: "54c277ba730d311f0ffc900ae8b3de64",
        },
        {
          url: "/header/remove-text.png",
          revision: "fa162aa4b9925a3131f4d4b041ae39cc",
        },
        {
          url: "/header/replace-background.png",
          revision: "fae64365c2e9bd5013bdbdc1cef730be",
        },
        {
          url: "/header/replace-object.png",
          revision: "b2c83e2d3f729cb90a3a7ade1c10cd7a",
        },
        {
          url: "/header/replace-sky.png",
          revision: "ed3710ea523110bee599abff4fe2a7b3",
        },
        {
          url: "/header/restore-face.png",
          revision: "4cda4cbd4bbd3392742fd12b8b13b450",
        },
        {
          url: "/header/txt2img.png",
          revision: "fb8c9a5c7dcda26ee411d616cac7478d",
        },
        { url: "/header/up.png", revision: "7c09de088b79e175e9e3984f79fe57f6" },
        {
          url: "/header/upscale.png",
          revision: "f62c340f1d14b31f04f3d651b1d58b22",
        },
        {
          url: "/home/arrow-right.svg",
          revision: "5d41e320da5a300a6d537e73992f44f6",
        },
        {
          url: "/home/arrowDown.svg",
          revision: "0a51840535d111d8bc962403c88fb5f9",
        },
        { url: "/home/bill.svg", revision: "7d2836f142139562f13e84ccdb051d7a" },
        {
          url: "/home/blueBorder.svg",
          revision: "fd07dddd0f13595428c1bc758c5d290e",
        },
        {
          url: "/home/blueHudu.svg",
          revision: "9b45d75d74c22d095daef5d0aa91e7a7",
        },
        {
          url: "/home/border-gradient.svg",
          revision: "9ef9dc1447675420badd8239d48be59e",
        },
        { url: "/home/cuda.svg", revision: "0d4bf4cdd4a47ff4ecb90f570481537f" },
        {
          url: "/home/cudnn.svg",
          revision: "6ba21e4168d44383b33656daba1ec247",
        },
        {
          url: "/home/earth.svg",
          revision: "19455188f9e411b0ce0184699f6167b0",
        },
        {
          url: "/home/email.svg",
          revision: "a2e16ebfc269121b3f6e1f0ebd1ac0ce",
        },
        {
          url: "/home/firstImg.svg",
          revision: "1ad9580fe76ea4f5b0bf7ef52b9632ad",
        },
        { url: "/home/go.svg", revision: "58ece5031f82b9617d6439f6bb93b938" },
        {
          url: "/home/grayBorder.svg",
          revision: "b2467fe6e1726a091f085bd5473b012c",
        },
        {
          url: "/home/infrLogo.png",
          revision: "8da9d164c762819d8ef15a0f59220e0e",
        },
        {
          url: "/home/infrLogo.svg",
          revision: "0fae6b10fd1ed471961ae50a4b760f0e",
        },
        {
          url: "/home/infrLogoText.svg",
          revision: "8bec35f8c71456f12f879a400bdfa734",
        },
        { url: "/home/java.svg", revision: "71602741a4a4bf1b45a8ba9a9769497b" },
        {
          url: "/home/jupyter.svg",
          revision: "ee8af47a5f1fb6fa4cad9bf14ee14686",
        },
        {
          url: "/home/lingxin.svg",
          revision: "828f2c8b5dc7dfa38ae44c10a1ad9b3e",
        },
        {
          url: "/home/llama.svg",
          revision: "0fda9cf8f0f62b09f0e1958199b4067f",
        },
        { url: "/home/logo.svg", revision: "fdab4e76948e65856615d7fea0ed9b8a" },
        { url: "/home/node.svg", revision: "141f6d80b5ef40e73ceb73663fc58375" },
        { url: "/home/php.svg", revision: "e4078f014718774134ac560a834116ae" },
        {
          url: "/home/python.svg",
          revision: "af5b3fa9bf26bd83f8d18e317a5335f2",
        },
        {
          url: "/home/pytorch.svg",
          revision: "b893ac5ca45fb315a57682b2da81b7fa",
        },
        {
          url: "/home/radioCheck.svg",
          revision: "af7cf6c482e67f5873284f6b4975ec72",
        },
        {
          url: "/home/radioUncheck.svg",
          revision: "211d11a5c3798257bd9deac67f87e8de",
        },
        {
          url: "/home/rotateImg.png",
          revision: "07a2faa0e20495d3cf1ae385ddfd83de",
        },
        {
          url: "/home/rotateShadow.svg",
          revision: "e42db07ed45dc36a496772ce58ae46ed",
        },
        { url: "/home/ruby.svg", revision: "3224dbb1fc39eb5a9827ffde52dd866d" },
        {
          url: "/home/shield.svg",
          revision: "6628f35bb834bd393a6bb9f4ac3e3055",
        },
        {
          url: "/home/stoble.svg",
          revision: "603c91be7e215c08944164a5a10faab5",
        },
        {
          url: "/home/tensor.svg",
          revision: "01daa3cde81aad06e1ab37671127e59d",
        },
        {
          url: "/home/trangle.svg",
          revision: "a2b16b07b4be94eba659ca3c5a312be1",
        },
        {
          url: "/home/whiteBorder.svg",
          revision: "69a8f81814f5e493971ed06d548c5add",
        },
        {
          url: "/home/whiteHudu.svg",
          revision: "e07f889ea4c8f981c4972014c919a27f",
        },
        {
          url: "/homepage/cheap.png",
          revision: "9372d0b0b80567ca2766f9853a390d55",
        },
        {
          url: "/homepage/cheap_2x.png",
          revision: "d9783f59c400589d6011b9f44b17f78b",
        },
        {
          url: "/homepage/home-bg-1.png",
          revision: "b9331bcf43fda44f0c177a8ca1e30939",
        },
        {
          url: "/homepage/home-bg-2.png",
          revision: "3a33b852077aae6eb791459e2a99155e",
        },
        {
          url: "/homepage/home-bg-3.png",
          revision: "9525bb7bf35e765f6903e1640ad14de7",
        },
        {
          url: "/homepage/home-bg-4.png",
          revision: "4ccfef7d26c53c33da0b89a64ed9a5d8",
        },
        {
          url: "/hub/Cleanup.png",
          revision: "ea9a9370a33c74ab718d1751a353ace1",
        },
        {
          url: "/hub/ControlNet.png",
          revision: "967402e7f11e078590b2cdc6176a1e52",
        },
        {
          url: "/hub/Imageto Image.png",
          revision: "c0ddb4d1fb3de43fdbf15aed9999c08f",
        },
        {
          url: "/hub/Inpainting.png",
          revision: "11b73de8e2a8f8951bf57cdb2ddba701",
        },
        { url: "/hub/LORA.mp4", revision: "26db89c61c78794e89c2917e0f7d895f" },
        { url: "/hub/LORA.webm", revision: "8f65a2d54bd68d0e94c978e9e643cfb5" },
        { url: "/hub/LoRA.png", revision: "bcd8e34c0da2523de0215d9481f46d48" },
        { url: "/hub/More.png", revision: "db2c05c6e2ba13072f9457e898ea37bf" },
        {
          url: "/hub/Outpainting.mp4",
          revision: "31a6b7c9375294a68463b8fddc8d9e4d",
        },
        {
          url: "/hub/Outpainting.webm",
          revision: "5b79f7839d2cdf7201847b9cc5c08704",
        },
        {
          url: "/hub/Refiner.png",
          revision: "18b58ac8c79b46036f4b00070d763bb8",
        },
        {
          url: "/hub/Reimage.mp4",
          revision: "fe89b855b90eaf29e217c2ab48dbd291",
        },
        {
          url: "/hub/Reimage.png",
          revision: "cc4bc43279728a73141b25933954a5be",
        },
        {
          url: "/hub/Reimage.webm",
          revision: "b3545388d697ae5915c2f0f22c49308b",
        },
        {
          url: "/hub/Relight.png",
          revision: "c55d60bda67d5b423d51ad2e9ca6bfd2",
        },
        {
          url: "/hub/Removebg.jpeg",
          revision: "786d84c0e84a0e1169aef5971544692c",
        },
        { url: "/hub/SDXL.mp4", revision: "f3d2a017adce995193f161478653f739" },
        { url: "/hub/SDXL.png", revision: "7b3f0131411a824b1f650f23f727e8b9" },
        { url: "/hub/SDXL.webm", revision: "ee60e5de02ca57a1261d0c4845c74b26" },
        {
          url: "/hub/TexttoImage.png",
          revision: "2a50c8b724ac46e1e57a2bfa0c6cb6a4",
        },
        {
          url: "/hub/Upscale.png",
          revision: "ffe491d62d255839e450777ce386dcd9",
        },
        {
          url: "/hub/controlNet_2x.png",
          revision: "8e63b23c06057bed1748364f5b026889",
        },
        {
          url: "/hub/img2img.mp4",
          revision: "e02c1acd465ad545a33ffc4ccd258c58",
        },
        {
          url: "/hub/img2img.png",
          revision: "ebd5c1c20f517c4f7e1891f9a5084fbb",
        },
        {
          url: "/hub/img2img.webm",
          revision: "9d3832ebafaf68774e222cf18c32b447",
        },
        {
          url: "/hub/img2img_2x.png",
          revision: "c7ffb0425d6ebfe05a47081838b3a53e",
        },
        {
          url: "/hub/inpainting.mp4",
          revision: "ecc2102e26a43eb6d903e2573722e4d1",
        },
        {
          url: "/hub/inpainting.webm",
          revision: "0a44e07161b01f719121aa9f60e230fb",
        },
        {
          url: "/hub/inpainting_2x.png",
          revision: "320e611ff171c2bab6f623f0a7e9b165",
        },
        {
          url: "/hub/lora_2x.png",
          revision: "7f392cb1f8e5782748c0d50d81daca8c",
        },
        {
          url: "/hub/more_2x.png",
          revision: "d2e962f545be38221844e8c21c573dcd",
        },
        {
          url: "/hub/outpainting.png",
          revision: "1500d88e258fb441e5de3b92996b1a2d",
        },
        {
          url: "/hub/sdxl_2x.png",
          revision: "11694b13d1e8345f5eae01ebe22ee434",
        },
        {
          url: "/hub/text2img_2x.png",
          revision: "6f9dc4a5ff79ee91e1fb826f07c4a64c",
        },
        {
          url: "/hub/txt2img.mp4",
          revision: "7346bb4f35a8b0d7d24039136c3d8df5",
        },
        {
          url: "/hub/txt2img.png",
          revision: "1f68a910a75c64d55c45039b1df0c4c4",
        },
        {
          url: "/hub/txt2img.webm",
          revision: "524706436382a6a77eb747c51faf7ba9",
        },
        {
          url: "/hub/uncrop.png",
          revision: "239c291225d241a5fcee485daf80a21a",
        },
        {
          url: "/icon-128x128.png",
          revision: "9b4c5f0cf6f7f058d7a96440e683c9d0",
        },
        {
          url: "/icon-144x144.png",
          revision: "8b6ac473feeee64c53fc042a83ea58fc",
        },
        {
          url: "/icon-152x152.png",
          revision: "d8b92e0b9a0c807cd39d0066e5f799e8",
        },
        {
          url: "/icon-192x192.png",
          revision: "18ab0dbda1b3c82975273ebf23db2624",
        },
        {
          url: "/icon-384x384.png",
          revision: "779a79c84f53acf602eacc10894c11aa",
        },
        {
          url: "/icon-512x512.png",
          revision: "839856e43618161cc0ac0f21a535db4c",
        },
        {
          url: "/icon-72x72.png",
          revision: "78f5a323ab1986d4174f1c4203e57e4f",
        },
        {
          url: "/icon-96x96.png",
          revision: "37d9a3cab494116304ef5ce9929af2d6",
        },
        { url: "/icon-logo.png", revision: "825eecdef498e0e6d950fd9cba2b75ea" },
        {
          url: "/image-config.json",
          revision: "2eec7eb1867d921e113f92697c5924ef",
        },
        {
          url: "/imageMarks/consoleLogoShort.svg",
          revision: "e360567360eed683d7411f5db238a25a",
        },
        {
          url: "/imageMarks/docker.png",
          revision: "b8d4c87f1c78af620db42df2d2c0797d",
        },
        {
          url: "/imageMarks/pytorch.png",
          revision: "70d20b1d8a34620a1f6a8bbfcdd9262a",
        },
        {
          url: "/imageMarks/tensorflow.png",
          revision: "af748b0bd9f22d57484883bb7a85a692",
        },
        {
          url: "/images/img_0.png",
          revision: "b20ea2e5418cd6b3cb73f65fa6d514ab",
        },
        {
          url: "/images/img_1.png",
          revision: "7b6c9612560b885697694a34399799b8",
        },
        {
          url: "/images/img_2.png",
          revision: "41f25561d8acb9fae38a9e7f5b7e6ea8",
        },
        {
          url: "/instances/icon-dataCenter.png",
          revision: "74e7810d8aaac7341e7a8431951980a9",
        },
        {
          url: "/instances/icon-dataCenter.svg",
          revision: "bd148ef3fe6b070fcd3d9550fe22cd05",
        },
        {
          url: "/instances/icon-delete.png",
          revision: "8be721723971151ce5d71384ce2ea4ab",
        },
        {
          url: "/instances/icon-delete.svg",
          revision: "78e3038c87e687d699264ae9f053e733",
        },
        {
          url: "/instances/icon-editInstance.png",
          revision: "1598edf07092548bd8efb47347520507",
        },
        {
          url: "/instances/icon-editInstance.svg",
          revision: "37bae95146114c0fc0640b7292a86fad",
        },
        {
          url: "/instances/icon-editName.png",
          revision: "43875870ab7e9b0017323158943b772d",
        },
        {
          url: "/instances/icon-editName.svg",
          revision: "dfe7909c79c5a7a1c8982c9729ddb606",
        },
        {
          url: "/instances/icon-help.png",
          revision: "9340aff79bbd677b4158d70875126568",
        },
        {
          url: "/instances/icon-help.svg",
          revision: "1922c59f9282d907169fed35377ea7c5",
        },
        {
          url: "/instances/icon-lock.svg",
          revision: "94703ffd79d1719c8434d97fdfc0cc8f",
        },
        {
          url: "/instances/icon-pauseInstance.png",
          revision: "fe6898e8e3f7ae1f56090cedfed46691",
        },
        {
          url: "/instances/icon-pauseInstance.svg",
          revision: "c48d7bd5a1909859b8f8ca60a2e81547",
        },
        {
          url: "/instances/icon-refresh.png",
          revision: "6bed3f82f3bde42fb9381f4078191a29",
        },
        {
          url: "/instances/icon-search.svg",
          revision: "8e83730b08b8a92d006f12f9bdcd1200",
        },
        {
          url: "/instances/icon-startInstance.svg",
          revision: "dcbdd214471eb98ba5364082e47e80d4",
        },
        {
          url: "/instances/icon-upgrade.png",
          revision: "bac2f6d6d45bb89dcd64fcf925c1ab40",
        },
        {
          url: "/instances/icon-upgrade.svg",
          revision: "fbd8c1403f9e7d5effaea760d540b0f4",
        },
        { url: "/loading.gif", revision: "3189b69e3248eb3bd7c9b37a36a70451" },
        {
          url: "/login/icon-email.png",
          revision: "61c5c11c57a2cf9519d9cb97637fa958",
        },
        {
          url: "/login/icon-email.svg",
          revision: "6f2720079112a1a887aa6efe2b3897dc",
        },
        {
          url: "/login/icon-github.svg",
          revision: "eabb0c2e90dc364cbab05b34cba2a6f9",
        },
        {
          url: "/login/icon-github2.svg",
          revision: "b15b52fb66d195b4794d3f9fb2cde9f9",
        },
        {
          url: "/login/icon-google.svg",
          revision: "08d2dab3e10149608f984644ebee4c34",
        },
        {
          url: "/login/icon-google2.svg",
          revision: "21967986e0946c900cfb86f600bff205",
        },
        {
          url: "/login/icon-passwordClosed.svg",
          revision: "67eb07827f1fbf04fe9f36d3f09e37ae",
        },
        {
          url: "/login/icon-passwordOpen.svg",
          revision: "8ff38e0c856e1fea0ff4c1ea0db8dc95",
        },
        { url: "/logo/X.svg", revision: "58e8dd0cb2fd7ce3e8d77feab0af6fd3" },
        {
          url: "/logo/consoleLogo.png",
          revision: "272828fe329085a9c28b81dc810436bd",
        },
        {
          url: "/logo/consoleLogo.svg",
          revision: "ab61de00ef48d81a3e6900f84c2bbd0b",
        },
        {
          url: "/logo/consoleLogoShort.svg",
          revision: "e360567360eed683d7411f5db238a25a",
        },
        {
          url: "/logo/discord.png",
          revision: "33f85726ccc942c0ebf5b08c6a66bcfd",
        },
        {
          url: "/logo/discord.svg",
          revision: "e29cd60829e39d8e468b9fd518326590",
        },
        { url: "/logo/logo.png", revision: "128696f0ad9c576565f766a24caf628c" },
        {
          url: "/logo/logo_small.png",
          revision: "da0c7ed89c7e36a464b230ad2b60bff6",
        },
        {
          url: "/logo/logo_small_grey.png",
          revision: "28c5d664e1e4a45d9ec3387f2bed6b9d",
        },
        {
          url: "/logo/logo_xmas.png",
          revision: "f5b17b6c43726ff2edddded0536ef06c",
        },
        { url: "/logo/q.png", revision: "a4aa0a00eb73c1186abb2aad9d44e118" },
        {
          url: "/logo/twitter.png",
          revision: "4d11a93b655b85f4898f81119d5438c3",
        },
        {
          url: "/mainPageImages/firstAnimation/img_0.png",
          revision: "1d5e7fc0018bcbefdbe9a749aad05807",
        },
        {
          url: "/mainPageImages/fourAnimation/img_0.png",
          revision: "863deb3a3d4cf00f8b3ad3964344078f",
        },
        {
          url: "/mainPageImages/fourAnimation/img_1.png",
          revision: "1d2ce730541c606e59a5d6748c8163b6",
        },
        {
          url: "/mainPageImages/fourAnimation/img_2.png",
          revision: "01ea3c803b9d4f821e20893cfc866456",
        },
        {
          url: "/mainPageImages/fourAnimation/img_3.png",
          revision: "adfc64e604242db5d6d96c1b299c454e",
        },
        {
          url: "/mainPageImages/fourAnimation/img_4.png",
          revision: "17788899502ee889534c8d403bada0e3",
        },
        {
          url: "/mainPageImages/fourAnimation/img_5.png",
          revision: "f415a433acda6097c60357c5a996e7c2",
        },
        {
          url: "/mainPageImages/fourAnimation/img_6.png",
          revision: "b2acee74afe7909166571ac45a2ab22b",
        },
        {
          url: "/mainPageImages/secondAnimation/img_0.png",
          revision: "0f92cee89e08721a716675119c9f5b43",
        },
        {
          url: "/mainPageImages/secondAnimation/img_1.png",
          revision: "14a349131abe5036f1d89eec2c45b009",
        },
        {
          url: "/mainPageImages/secondAnimation/img_2.png",
          revision: "4dfeb4da5711a75e08a80adf44b5acd7",
        },
        {
          url: "/mainPageImages/secondAnimation/img_3.png",
          revision: "a0897f3c6d203d88d159737b2e3e6b33",
        },
        {
          url: "/mainPageImages/secondAnimation/img_4.png",
          revision: "6ea261c97344b61a408dee96af638734",
        },
        {
          url: "/mainPageImages/secondAnimation/img_5.png",
          revision: "dcad9ef4712506b369cd629ce3cc38f9",
        },
        {
          url: "/mainPageImages/sixAnimation/img_0.png",
          revision: "73d048f832d65e9a52af3b4976e86784",
        },
        { url: "/manifest.json", revision: "3d8f35428dac79994e37f9074b977d7b" },
        {
          url: "/motions/1.jpeg",
          revision: "89e2faf765fc249b7f042960359dae9c",
        },
        {
          url: "/motions/2.jpeg",
          revision: "ef0bf6a7fd87f63f830c2c11823b49d4",
        },
        {
          url: "/motions/3.jpeg",
          revision: "6434933ed1671bfb53d230fa4248af48",
        },
        {
          url: "/motions/4.jpeg",
          revision: "077be62fec4824e6cc80996736635c06",
        },
        {
          url: "/motions/5.jpeg",
          revision: "59078b2eeaa0815336983b4ccd4807de",
        },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/not_found.png", revision: "002f5facdd6a1679fe236242c9c37c7f" },
        {
          url: "/password/icon-success.svg",
          revision: "bb9e50ba3bda4e2acaa5f783b52c23c9",
        },
        {
          url: "/platform/AWS.png",
          revision: "4f695aeae747ff437e9f93e0afda5845",
        },
        {
          url: "/platform/Delta.png",
          revision: "07dc58150b3fa4914be1cd29bd507096",
        },
        {
          url: "/platform/Google.png",
          revision: "22592a596514ddbe206cd791659a4f5f",
        },
        {
          url: "/platform/Mircrosoft.png",
          revision: "ee4bfb15ee1a80028432f28ad7e1e0a6",
        },
        {
          url: "/platform/OpenAI.png",
          revision: "6759ab5bd497bad40cfc38beda08fb8e",
        },
        {
          url: "/platform/countriesServed.png",
          revision: "72fdc1debac892eca207e5c7b4373a42",
        },
        {
          url: "/platform/developers.png",
          revision: "fb6dbec35e6c076b7b7d374e63952ffe",
        },
        {
          url: "/platform/imageGeneration.png",
          revision: "7974a60124fcd336e7e843808b07d520",
        },
        {
          url: "/platform/twiiio.png",
          revision: "cf5b27dc2a4b315bd559edbd70c784c1",
        },
        {
          url: "/playground/app-icon_restore-face.png",
          revision: "d04e39d683bd2f76923f43cc06cd0e11",
        },
        {
          url: "/playground/developing.png",
          revision: "38270471fce603eec172888ce323fcdb",
        },
        {
          url: "/playground/icon-Balance.png",
          revision: "c3a09f0a7661da303ff63b420caf1c64",
        },
        {
          url: "/playground/icon-Billing-Selected.png",
          revision: "bc46f2ed5ebaa620dcc41c16bea279d0",
        },
        {
          url: "/playground/icon-Billing-Selected.svg",
          revision: "324b353fea8d824ad2f41a04fb8759f3",
        },
        {
          url: "/playground/icon-Billing.png",
          revision: "ce7a5fed6395ff3e351c0e7b939173c1",
        },
        {
          url: "/playground/icon-Billing.svg",
          revision: "e8fad4878df30317a0a254daad8487c9",
        },
        {
          url: "/playground/icon-Explore-Selected.png",
          revision: "5705799f8a256ac278baa850f8dd4da0",
        },
        {
          url: "/playground/icon-Explore-Selected.svg",
          revision: "15ca0316985eb8618d2a80534d7929d1",
        },
        {
          url: "/playground/icon-Explore.png",
          revision: "649f4c4337835831a91befd9941515f9",
        },
        {
          url: "/playground/icon-Explore.svg",
          revision: "ffdf594ecd082ea296f1659e7b8ff616",
        },
        {
          url: "/playground/icon-Instances-Selected.png",
          revision: "1fcafd2e36d7047b4214649063c76e34",
        },
        {
          url: "/playground/icon-Instances-Selected.svg",
          revision: "d7f3fc65d8c3fca148cd3cd6a1bc0d8a",
        },
        {
          url: "/playground/icon-Instances.png",
          revision: "30115b0f10a268cd1b6386953bcc3a07",
        },
        {
          url: "/playground/icon-Instances.svg",
          revision: "fbbee6230c9aaac8385eda998e0f450b",
        },
        {
          url: "/playground/icon-Savings Plans-Selected.png",
          revision: "8f261824db56abb21acf813ee2c523a6",
        },
        {
          url: "/playground/icon-Savings Plans-Selected.svg",
          revision: "1502dbe4cf19ff0b1572338125fd2c65",
        },
        {
          url: "/playground/icon-Savings Plans.png",
          revision: "9cf4a2ba57e54b8a7258291b3f8ee0c8",
        },
        {
          url: "/playground/icon-Savings Plans.svg",
          revision: "303fbf4dc972a861ffd30880684913bd",
        },
        {
          url: "/playground/icon-Settings-Selected.png",
          revision: "6819a7b9b2002297b1c7f0d658d43c78",
        },
        {
          url: "/playground/icon-Settings-Selected.svg",
          revision: "03775b926f76587e1b3b1deddce1d0e0",
        },
        {
          url: "/playground/icon-Settings.png",
          revision: "49d04832e29d215be84f2532fcdabae9",
        },
        {
          url: "/playground/icon-Settings.svg",
          revision: "4ee5f69b18ed72991555704eb76ef23f",
        },
        {
          url: "/playground/icon-Storage-Selected.png",
          revision: "459d1a64a14ff274608d726168a608a0",
        },
        {
          url: "/playground/icon-Storage-Selected.svg",
          revision: "6e33596b7b7dc662e91c7545855bc199",
        },
        {
          url: "/playground/icon-Storage-mark.png",
          revision: "8ac676df23d8fcbfc371c9afb7295b3d",
        },
        {
          url: "/playground/icon-Storage.png",
          revision: "8d98cffb927d3752a95efbd5200c644f",
        },
        {
          url: "/playground/icon-Storage.svg",
          revision: "ec538334ebde1f5e7c6a965b5732e9f0",
        },
        {
          url: "/playground/icon-Templates-Selected.png",
          revision: "a926df9d2b32bb39b6b74e9e59132520",
        },
        {
          url: "/playground/icon-Templates-Selected.svg",
          revision: "825b046d026d2ff641cca5f0c9e5b2ac",
        },
        {
          url: "/playground/icon-Templates.png",
          revision: "95fae558762bd4a6f3981cebb0bafde0",
        },
        {
          url: "/playground/icon-Templates.svg",
          revision: "54b610b167b42c804e68444a8706d2f3",
        },
        {
          url: "/playground/image-placeholder.png",
          revision: "f132aef5f431213d4de5c592c3ff0ba4",
        },
        {
          url: "/playground/nav-head.png",
          revision: "29c67c5f4ffce590a5759bff8c8f574c",
        },
        {
          url: "/playground/sad.svg",
          revision: "614f128aba25f40a56a052493966a3de",
        },
        {
          url: "/playground/smile.svg",
          revision: "334981ddcc4886fca7fdd9c219d9da82",
        },
        {
          url: "/prices/border.svg",
          revision: "432eb5e25c8597b89f031fe29f89d4c3",
        },
        {
          url: "/prices/leftBorder.svg",
          revision: "0a2d79f3911bdafbc9c84681e3534ae7",
        },
        {
          url: "/pricing/card.svg",
          revision: "77a92d976a12358a02c5d5e1f47bce3d",
        },
        {
          url: "/pricing/diamond.svg",
          revision: "06f3b7fce7a22ccc8a8ba2b9cb74810f",
        },
        {
          url: "/pricing/dollar.png",
          revision: "c6ebc1120fb03beadb47c43939c5e8c4",
        },
        {
          url: "/pricing/email.svg",
          revision: "7bbdf9c331ed395f8662a5b7c4bdc487",
        },
        {
          url: "/pricing/enterprise.svg",
          revision: "b048e8aea9cac03a6c60c2056a3765a7",
        },
        {
          url: "/pricing/gift.svg",
          revision: "7ae8c84d2aea60c420bb52a2421bd890",
        },
        {
          url: "/pricing/master.svg",
          revision: "81496b65924763d065b2906eee01a218",
        },
        {
          url: "/pricing/stripe.svg",
          revision: "bd0d64ec97dcc7dce0908b02049024ec",
        },
        {
          url: "/pricing/usdt.svg",
          revision: "ca9eb63eee48eadb4014ae11b441935d",
        },
        {
          url: "/pricing/visa.svg",
          revision: "755ee99a192da387fbc38cf22902d19d",
        },
        {
          url: "/pricing/warning.svg",
          revision: "fd5adc8569e27bdff5f1e8a2dd540e50",
        },
        { url: "/robots.txt", revision: "8db9348ad3defd740b7838b892511920" },
        {
          url: "/savingsPlans/icon-search.svg",
          revision: "18c91e2bb4d9a9be8cccdf7d47c11abf",
        },
        {
          url: "/settings/icon-delete.png",
          revision: "8be721723971151ce5d71384ce2ea4ab",
        },
        {
          url: "/settings/icon-delete.svg",
          revision: "78e3038c87e687d699264ae9f053e733",
        },
        {
          url: "/showcase/blogbing_2x.png",
          revision: "ea5bb25c3aee6b0c961e7bc2e0504c37",
        },
        {
          url: "/showcase/dazzleai_2x.png",
          revision: "3a63078ed7fef2f270bccb8d1ad68d1e",
        },
        {
          url: "/showcase/getbotz_2x.png",
          revision: "7bf833c3ffd3962235de5fa57b68c89c",
        },
        {
          url: "/showcase/show-case-wrap.png",
          revision: "af74f3b2ab1e95c6c651dbbe99a6d854",
        },
        {
          url: "/showcase/telegram_bot_2x.png",
          revision: "78505366740aef6930ad7e52e3cb371b",
        },
        {
          url: "/sitemap-page.xml",
          revision: "abefd2d93b3d0108b30a3f163190da0a",
        },
        { url: "/sitemap.xml", revision: "3eb29c98b632446cb7d3b4675036867d" },
        {
          url: "/storage/icon-help.png",
          revision: "9340aff79bbd677b4158d70875126568",
        },
        {
          url: "/storage/icon-storage-checked.png",
          revision: "fa0758df48a2d0361b8865be18dbba25",
        },
        {
          url: "/storage/icon-storage-checked.svg",
          revision: "153886c9e56ab4488b2ad11c50b93136",
        },
        { url: "/stripe-4.png", revision: "988a0e0a83505b01d22de502519584c7" },
        {
          url: "/templates/icon-copy.png",
          revision: "3a454e2005d7add66343780b5a0f1b99",
        },
        {
          url: "/templates/icon-copy.svg",
          revision: "2982a5e6199ea77b54dfaf874bd05ff5",
        },
        {
          url: "/templates/icon-delete.png",
          revision: "a923e85fcc766d289baedd8f33f997ed",
        },
        {
          url: "/templates/icon-delete.svg",
          revision: "78e3038c87e687d699264ae9f053e733",
        },
        {
          url: "/templates/icon-edit.png",
          revision: "e367f50d6d801fd8a76e4fdd302b5004",
        },
        {
          url: "/templates/icon-edit.svg",
          revision: "c04213adf1d5c73c5ee1749cca53bb11",
        },
        {
          url: "/tools/cleanup.mp4",
          revision: "c083c6553f02b0385b8262f45ca23657",
        },
        {
          url: "/tools/cleanup.webm",
          revision: "0929f8b7a009517f0a69e35a8e7bb6bc",
        },
        {
          url: "/tools/img2img.mp4",
          revision: "c5c7f204a1738d1e653adab8799b3a31",
        },
        {
          url: "/tools/img2img.webm",
          revision: "1d05c6457e882eafc750fe259d331a63",
        },
        {
          url: "/tools/lcmtxt2img.mp4",
          revision: "1c25d8a1e63079fa2dfad3ab97a37ee2",
        },
        {
          url: "/tools/lcmtxt2img.webm",
          revision: "dd4fc4eb51a6ccebc29c7c16c8300ffb",
        },
        {
          url: "/tools/outpainting.mp4",
          revision: "11c76fd958779912e1ce2e7b182fd742",
        },
        {
          url: "/tools/outpainting.webm",
          revision: "6e5ac236428093fb5c2af2b1dc29070e",
        },
        {
          url: "/tools/reimagine.mp4",
          revision: "e68c7839114999fb97546b2c18c54892",
        },
        {
          url: "/tools/reimagine.webm",
          revision: "2d6b25fc0ed0be6f4d3372b63fd71875",
        },
        {
          url: "/tools/removeBackground.mp4",
          revision: "cb00a06488390089549e6799436b159e",
        },
        {
          url: "/tools/removeBackground.webm",
          revision: "96d98f305cc3ce55ebf0fc6f64ec6082",
        },
        {
          url: "/tools/removetext.mp4",
          revision: "f8cc45b79d593528c414e6f61d492ccf",
        },
        {
          url: "/tools/removetext.webm",
          revision: "b81ceda95e267b9234e2dd40dda4de82",
        },
        {
          url: "/tools/removewatermark.mp4",
          revision: "e70d3ddc6c093e6657a5d9740e6a9387",
        },
        {
          url: "/tools/removewatermark.webm",
          revision: "0e9ea3420c9801ac438dde7e13131c4f",
        },
        {
          url: "/tools/replacesky.mp4",
          revision: "870fef754fc017acc14514bb2b07a27a",
        },
        {
          url: "/tools/replacesky.webm",
          revision: "5c5edca54587ec1ee0cfcf06b92c85ac",
        },
        {
          url: "/tools/tool-wrap-1.png",
          revision: "56b9bca58b412d6917707270ead0173e",
        },
        {
          url: "/tools/tool-wrap-2.png",
          revision: "6ff783ccc1052027bda40dead52fb557",
        },
        {
          url: "/tools/txt2img.mp4",
          revision: "ea7f70ba3d9c74b1f1a5baca9d3485da",
        },
        {
          url: "/tools/txt2img.webm",
          revision: "ad710916bdb1ff114a639e9c6578774c",
        },
        {
          url: "/tools/upscaling.mp4",
          revision: "4454175b9e9a761494eb7637a0fe6034",
        },
        {
          url: "/tools/upscaling.webm",
          revision: "97f5cefc6d3755e6524ebe215873ae62",
        },
        {
          url: "/training/example1.png",
          revision: "9aafc57bbaa4dc1add68e728b09528ee",
        },
        {
          url: "/training/example2.png",
          revision: "74396a3fa353d190077af7d90ba380bf",
        },
        {
          url: "/training/example3.png",
          revision: "52d3c829ad0e72f527d5d3c55b439571",
        },
        { url: "/vercel.svg", revision: "61c6b19abff40ea7acd577be818f3976" },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: i,
              state: c,
            }) =>
              a && "opaqueredirect" === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: "OK",
                    headers: a.headers,
                  })
                : a,
          },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const a = e.pathname;
        return !a.startsWith("/api/auth/") && !!a.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET",
    ));
});
