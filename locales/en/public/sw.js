if (!self.define) {
  let e,
    i = {};
  const a = (a, c) => (
    (a = new URL(a + ".js", c).href),
    i[a] ||
      new Promise((i) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = a), (e.onload = i), document.head.appendChild(e));
        } else ((e = a), importScripts(a), i());
      }).then(() => {
        let e = i[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, s) => {
    const r =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (i[r]) return;
    let d = {};
    const n = (e) => a(e, r),
      o = { module: { uri: r }, exports: d, require: n };
    i[r] = Promise.all(c.map((e) => o[e] || n(e))).then((e) => (s(...e), d));
  };
}
define(["./workbox-9b4d2a02"], function (e) {
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
          revision: "b7c520efc7f685cd3f4776ffa597c1d8",
        },
        {
          url: "/_next/static/YW3fa8P8gvhRvG-dXFH6i/_buildManifest.js",
          revision: "2b54d7db375d2b4c0e6af318090bebea",
        },
        {
          url: "/_next/static/YW3fa8P8gvhRvG-dXFH6i/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/1034-3db7866d38cc958c.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/1078-aa3c528479a6b8fc.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/1428-0756178a834ee95b.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/1777-15bb5bc858b8bae1.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/1814-7d7503766771c650.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/19-51cc2cc93db41648.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/2352-b43844d9d22858a2.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/2579-e73b378199db5432.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/2877-9edc6d290310a519.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/3979-5933dc9d19d115d9.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/3990-ac58648236cb7be9.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/4-47063bf6525a6a00.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/412-7caff0285bc348d8.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/4368-57e66303bfc407fd.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/5136-d26b93f7c974bcf2.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/5186-5cd03f764f432f6d.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/5210-aaa32dd278eb37bb.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/5229-0e35c10728e0bb06.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/5847-c3975f68c8364d04.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/6369-6c9dd249407f8896.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/6400-e185c95d0cc598df.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/670-6241779ab2b591f6.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/6925-cf82ab571fc9df15.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/6998-d3b46ffa6c880647.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/7777.feb6010dfac3decf.js",
          revision: "feb6010dfac3decf",
        },
        {
          url: "/_next/static/chunks/7979-5243c73d3a815fe7.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/8016-caa54730bbb01749.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/8069-e30d7a5298fa7c4f.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/8410-16ba6dd415db1c37.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/844-f639f7708c01232e.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/8623-b819e1b3c03a6792.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/8685-612e31830addcb87.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/8707-98209412833ec449.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/8792-5abef5b6b9ec6581.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/9235-5fc69155fc298547.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/9485-afb835485d962e4c.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/9494-39297222e1644bfa.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/94ca1967.d52c927ef292d8b2.js",
          revision: "d52c927ef292d8b2",
        },
        {
          url: "/_next/static/chunks/964ecbae.1b756a534434f8a0.js",
          revision: "1b756a534434f8a0",
        },
        {
          url: "/_next/static/chunks/9735-18d2920ec3d8f89e.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/9831-c257e15f854461bb.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/about/page-7d1f7ca2547d264e.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/dashboard/billing/page-a5ca6076d8edc544.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/dashboard/billing/success/page-fdfa7e4e456d551e.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/dashboard/key/page-6c70196037038693.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/dashboard/layout-37cb6fcd51dbe7ee.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/dashboard/page-e4ff24e4d00892ff.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/image/%5Bkeyword%5D/page-850a89860ae6e333.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/layout-39fd797d4a102a3a.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/legal/layout-b7e5c87cf30b6303.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/legal/page-b28af6405a4fe046.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/legal/privacy-policy/page-fa4781bd123e3afc.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/legal/terms-of-service/page-a31283190a92905b.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/model/%5Bversion_id%5D/page-d45bef63bd765f48.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/model/page-69bd6488311d39b9.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/model/upload/page-d368116034f79319.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/not-found-b7fa0884bb9ceda9.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/page-7a624989e833df1a.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/playground/layout-9e1a740dfd48d484.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/playground/page-8db678d1b91c212f.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/pricing/page-7ed24901328e9d1b.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/LoRA-training/page-ff5ba8301b298281.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/cleanup/page-cb8e8db9204c35a5.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/components/products/page-308148d4591a07e2.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/create-tile/page-4856b3a30f46e6be.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/doodle/page-e1a7d34c6b6d80ae.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/img2img/page-eb3c6931800885ab.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/img2video-motion/page-cce04998ab04b45a.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/img2video/page-2d7411ba720f1128.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/inpainting/page-9aa7603d42dd2c37.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/lcm-img2img/page-844990adb54f500e.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/lcm-txt2img/page-0bd3211976ea26cd.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/merge-face/page-c6a78141a47001c9.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/mix-pose/page-34787e245d91f864.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/outpainting/page-d5facc85c6980c7e.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/reimagine/page-a5ba6fb46f0f6b1c.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/remove-background/page-a96aa7f1e6f57fd1.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/remove-text/page-79d146754cd6de89.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/remove-watermark/page-c56e7d6d26b48eb2.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/replace-background/page-456134f7d153d635.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/replace-object/page-ef3e01ecc1269eca.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/replace-sky/page-48e81149e45d74ca.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/restore-face/page-f56a10d5dbb55e34.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/sdxl-turbo/page-8dac06dd5b6a3bc7.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/speech2txt-translate/page-1663e2df50d41a61.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/speech2txt/page-531d77298fd77dc9.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/txt2img/page-3dd181e773e50c4f.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/txt2speech/page-01c73a21107f4a57.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/txt2video/page-e22dd20840541f07.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/upscale/page-84d6ed923d4f8bcb.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/video-magic-cut/page-b1b75562b458b027.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/video-remove-object/page-3c490f77264d2b93.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/video-remove-subtitle/page-511baf607d354b69.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/video-remove-watermark/page-4b975baefe5e9c87.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/video-translate/page-5b6ef9e45303f15a.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/video-upscale/page-0a0bb9ebf786163e.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/voice-cloning-instant/page-e41b87624265403a.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/app/product/voice-cloning/page-e63aeb06366afc36.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/fd9d1056-18c83453b5a4b32a.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/framework-08aa667e5202eed8.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/main-51aece3f43d234dc.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/main-app-08c30c78ac58d1fc.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/pages/_app-57bdff7978360b1c.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/pages/_error-29037c284dd0eec6.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-d6f2aa84f6ed7e3c.js",
          revision: "YW3fa8P8gvhRvG-dXFH6i",
        },
        {
          url: "/_next/static/css/09a9f11d388fc407.css",
          revision: "09a9f11d388fc407",
        },
        {
          url: "/_next/static/css/0b7eb879679fbb16.css",
          revision: "0b7eb879679fbb16",
        },
        {
          url: "/_next/static/css/0be9a392e37816e2.css",
          revision: "0be9a392e37816e2",
        },
        {
          url: "/_next/static/css/11e287af6801f98a.css",
          revision: "11e287af6801f98a",
        },
        {
          url: "/_next/static/css/1447ab5bc71d3dd7.css",
          revision: "1447ab5bc71d3dd7",
        },
        {
          url: "/_next/static/css/23f881cb33dceb55.css",
          revision: "23f881cb33dceb55",
        },
        {
          url: "/_next/static/css/25abaee4bb07d7c3.css",
          revision: "25abaee4bb07d7c3",
        },
        {
          url: "/_next/static/css/3af2b0e5167f29ae.css",
          revision: "3af2b0e5167f29ae",
        },
        {
          url: "/_next/static/css/44ec57fefa37b0ca.css",
          revision: "44ec57fefa37b0ca",
        },
        {
          url: "/_next/static/css/47bc0e6c2073dffd.css",
          revision: "47bc0e6c2073dffd",
        },
        {
          url: "/_next/static/css/47bf6d04fc5c9db7.css",
          revision: "47bf6d04fc5c9db7",
        },
        {
          url: "/_next/static/css/47d6a0fd934d3fc0.css",
          revision: "47d6a0fd934d3fc0",
        },
        {
          url: "/_next/static/css/4b3c61af2531fea8.css",
          revision: "4b3c61af2531fea8",
        },
        {
          url: "/_next/static/css/4be3a6241c9d8547.css",
          revision: "4be3a6241c9d8547",
        },
        {
          url: "/_next/static/css/4ed9d15f16a2ffac.css",
          revision: "4ed9d15f16a2ffac",
        },
        {
          url: "/_next/static/css/503b77a2ca910cd4.css",
          revision: "503b77a2ca910cd4",
        },
        {
          url: "/_next/static/css/525a3e205118e110.css",
          revision: "525a3e205118e110",
        },
        {
          url: "/_next/static/css/53a77896f80db02b.css",
          revision: "53a77896f80db02b",
        },
        {
          url: "/_next/static/css/54385538515526a1.css",
          revision: "54385538515526a1",
        },
        {
          url: "/_next/static/css/553e3e6ed061cdfe.css",
          revision: "553e3e6ed061cdfe",
        },
        {
          url: "/_next/static/css/582835c78f8ce3b3.css",
          revision: "582835c78f8ce3b3",
        },
        {
          url: "/_next/static/css/585d05b5e761f0c6.css",
          revision: "585d05b5e761f0c6",
        },
        {
          url: "/_next/static/css/59d5687da9a1a9d3.css",
          revision: "59d5687da9a1a9d3",
        },
        {
          url: "/_next/static/css/63c9f9f7959d46f0.css",
          revision: "63c9f9f7959d46f0",
        },
        {
          url: "/_next/static/css/6cae215471d9ed8b.css",
          revision: "6cae215471d9ed8b",
        },
        {
          url: "/_next/static/css/72f2567cbb64b946.css",
          revision: "72f2567cbb64b946",
        },
        {
          url: "/_next/static/css/7e4936cd05915633.css",
          revision: "7e4936cd05915633",
        },
        {
          url: "/_next/static/css/8a981e691ec5cf5c.css",
          revision: "8a981e691ec5cf5c",
        },
        {
          url: "/_next/static/css/8d21710aadf6ca6b.css",
          revision: "8d21710aadf6ca6b",
        },
        {
          url: "/_next/static/css/905b95bb0e377a24.css",
          revision: "905b95bb0e377a24",
        },
        {
          url: "/_next/static/css/9ea1aa196b424419.css",
          revision: "9ea1aa196b424419",
        },
        {
          url: "/_next/static/css/a4e7d483a6edfc86.css",
          revision: "a4e7d483a6edfc86",
        },
        {
          url: "/_next/static/css/a7f639937ff7d081.css",
          revision: "a7f639937ff7d081",
        },
        {
          url: "/_next/static/css/ac2f515b3c7c2237.css",
          revision: "ac2f515b3c7c2237",
        },
        {
          url: "/_next/static/css/aead20838d036d8c.css",
          revision: "aead20838d036d8c",
        },
        {
          url: "/_next/static/css/af2b4622dfbe4551.css",
          revision: "af2b4622dfbe4551",
        },
        {
          url: "/_next/static/css/af60082d209b5e35.css",
          revision: "af60082d209b5e35",
        },
        {
          url: "/_next/static/css/cc1c68dfa3342a41.css",
          revision: "cc1c68dfa3342a41",
        },
        {
          url: "/_next/static/css/ccf349fa118a9ff3.css",
          revision: "ccf349fa118a9ff3",
        },
        {
          url: "/_next/static/css/d34d60d26f5e253a.css",
          revision: "d34d60d26f5e253a",
        },
        {
          url: "/_next/static/css/e48a6fc71f1be57f.css",
          revision: "e48a6fc71f1be57f",
        },
        {
          url: "/_next/static/css/e666b625c5ac36d3.css",
          revision: "e666b625c5ac36d3",
        },
        {
          url: "/_next/static/css/e6b0ac8d8fd8b601.css",
          revision: "e6b0ac8d8fd8b601",
        },
        {
          url: "/_next/static/css/ea76b89d807ff491.css",
          revision: "ea76b89d807ff491",
        },
        {
          url: "/_next/static/css/f25d9396f53ad64a.css",
          revision: "f25d9396f53ad64a",
        },
        {
          url: "/_next/static/css/f33ce8be97a54263.css",
          revision: "f33ce8be97a54263",
        },
        {
          url: "/_next/static/css/f359bcd62787aa4c.css",
          revision: "f359bcd62787aa4c",
        },
        {
          url: "/advantage/cheap.png",
          revision: "f1409f8e2d4166ce810de2040bb5bcf0",
        },
        {
          url: "/advantage/cheap.webp",
          revision: "242397664e2ee193b6a08025106b06c6",
        },
        {
          url: "/advantage/fast.png",
          revision: "be31dd260cfcecf47c7c6f318da35ff0",
        },
        {
          url: "/advantage/fast.webp",
          revision: "26645c9be4ca7499a4f54dddb818945a",
        },
        {
          url: "/advantage/models.png",
          revision: "92b326865d7b85424c2da977df33e8f3",
        },
        {
          url: "/advantage/models.webp",
          revision: "9461dc22c54b47f7daaed353d20a51ed",
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
        { url: "/favicon.ico", revision: "8ac121ffd89da719465bf495ff21d0ea" },
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
        { url: "/footer/X.svg", revision: "37a12cfff362900c4f6749bf8cc0005d" },
        {
          url: "/footer/discord.png",
          revision: "fd5739e98d87c6e7c175e52afaba0b3f",
        },
        {
          url: "/footer/v5/x.png",
          revision: "3878e1ba8badfad081b8af59b43291e5",
        },
        {
          url: "/footer/v5/in.png",
          revision: "9b762ac05a21136f3088cba39dc328bc",
        },
        {
          url: "/footer/v5/discord.png",
          revision: "9d9678d43e5afa1bd4b06c673eb1c580",
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
          url: "/header/img2img.png",
          revision: "c0149a9f6c66a8a3da1c265ffb0117b8",
        },
        {
          url: "/header/img2video-motion.png",
          revision: "115fbae82e58dd74f6305a24cda1ada9",
        },
        {
          url: "/header/img2video.png",
          revision: "caa61a6573c0af55dbd42600801faf2f",
        },
        {
          url: "/header/inpainting.png",
          revision: "c0269c51143e86e4848301eb26b0c491",
        },
        {
          url: "/header/lcm-img2img.png",
          revision: "a60a191c87763173a1fd51b46c066d3b",
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
          url: "/header/reimagine.png",
          revision: "97836d4f6d1e3a572543407017024739",
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
          url: "/header/speech2txt-transcription.png",
          revision: "17a9f7d95b32d56bbf5304d1829cf79e",
        },
        {
          url: "/header/speech2txt-translation.png",
          revision: "a3ce2e3326f5ce46a1db8e9e5ff084b4",
        },
        {
          url: "/header/training.png",
          revision: "63cbe0d4ab8f0bfa086ef943bb176b7a",
        },
        {
          url: "/header/txt2img.png",
          revision: "fb8c9a5c7dcda26ee411d616cac7478d",
        },
        {
          url: "/header/txt2speech.png",
          revision: "763079940887b8f6c228c3a345c39bbb",
        },
        {
          url: "/header/txt2video.png",
          revision: "3dc67a917112297815f343a93d187e1e",
        },
        { url: "/header/up.png", revision: "7c09de088b79e175e9e3984f79fe57f6" },
        {
          url: "/header/upscale.png",
          revision: "f62c340f1d14b31f04f3d651b1d58b22",
        },
        {
          url: "/header/video-magic-cut.png",
          revision: "cf9eb8e9211b8ca0299dee45a78e0899",
        },
        {
          url: "/header/video-merge-face.png",
          revision: "e1242f3eb2e2736655b1b441541f9b79",
        },
        {
          url: "/header/video-remove-object.png",
          revision: "ab5b955a1c5c9c5068010055d934cc74",
        },
        {
          url: "/header/video-remove-subtitle.png",
          revision: "3e710679744b2626856225ff2944e0a6",
        },
        {
          url: "/header/video-remove-watermark.png",
          revision: "a3c641245d9bfd53880e3647ce66b4cd",
        },
        {
          url: "/header/video-translate.png",
          revision: "eda28c8f397fe5e3076d9b9a7c4ffa1b",
        },
        {
          url: "/header/video-upscale.png",
          revision: "433e19a7601c217e48a905303d0d7ebe",
        },
        {
          url: "/header/voice-cloning-instant.png",
          revision: "95ab976af39f3acc417b1a594dc722a1",
        },
        {
          url: "/header/voice-cloning.png",
          revision: "a994f781c50e82724f55875c97f16d2b",
        },
        {
          url: "/homepage/home-bg-1.png",
          revision: "033604f34f70bcf326f0c695a7a131cf",
        },
        {
          url: "/homepage/home-bg-1.webp",
          revision: "b3a0dec71dee93ea69da3298f4268957",
        },
        {
          url: "/homepage/home-bg-2.png",
          revision: "ed6112f0943a2120245ff8c1c17292e9",
        },
        {
          url: "/homepage/home-bg-2.webp",
          revision: "0b35bc6a9a536848d8ece4b10d601058",
        },
        {
          url: "/homepage/home-bg-3.png",
          revision: "d5eca34d3352d9608af306dec06cbbc9",
        },
        {
          url: "/homepage/home-bg-3.webp",
          revision: "1d09f5e8098dcaaedf4c6f08e9feb3ec",
        },
        {
          url: "/homepage/home-bg-4.png",
          revision: "afe91a9c3218e24fb0ff2ae2bbff37d1",
        },
        {
          url: "/homepage/home-bg-4.webp",
          revision: "92f3f023fb9d65674af4b9d068e4fef2",
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
        {
          url: "/image-config.json",
          revision: "07891c168bd4fd98af52ea6d46a1c032",
        },
        { url: "/logo/X.svg", revision: "58e8dd0cb2fd7ce3e8d77feab0af6fd3" },
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
        { url: "/manifest.json", revision: "fcd53e3e3595fc2d969eaffcbf6a9685" },
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
          url: "/playground/api-icon_LoRA.png",
          revision: "13b0ec0261f60caafd160e8d36d5e0bd",
        },
        {
          url: "/playground/api-icon_SDXL.png",
          revision: "945ad0399f53a2f0ce3107c15d08f911",
        },
        {
          url: "/playground/api-icon_cleanup.png",
          revision: "ebdc0f049d896418af3eed299ea57640",
        },
        {
          url: "/playground/api-icon_create-tile.png",
          revision: "29c83601cc69aa4bcf5238eb96785f21",
        },
        {
          url: "/playground/api-icon_doodle.png",
          revision: "cbead745fa70621434e2948ec6811341",
        },
        {
          url: "/playground/api-icon_img2img.png",
          revision: "5d7e701c1bc111ede10f02d12fadac17",
        },
        {
          url: "/playground/api-icon_img2video-motion.png",
          revision: "b4b092ce93e38f3adb354c9920c3d4de",
        },
        {
          url: "/playground/api-icon_img2video.png",
          revision: "104e65cc2630fa5304f3a5df8e1569c4",
        },
        {
          url: "/playground/api-icon_inpainting.png",
          revision: "d4bfb93976698b34c19bdca85be98bae",
        },
        {
          url: "/playground/api-icon_lcm-img2img.png",
          revision: "0bc9887e0e622644c9de37ec9114a64c",
        },
        {
          url: "/playground/api-icon_lcm-txt2img.png",
          revision: "f775cc448e14b56062b120b95f99d24b",
        },
        {
          url: "/playground/api-icon_merge-face.png",
          revision: "91f5b29db42c238d48dc867069adf356",
        },
        {
          url: "/playground/api-icon_mix-pose.png",
          revision: "91b429e8e7bb7597a75b2065110e0c55",
        },
        {
          url: "/playground/api-icon_outpainting.png",
          revision: "2210206116aef1ac6f74b6b629b87e46",
        },
        {
          url: "/playground/api-icon_refiner.png",
          revision: "b3f3679432c1304540dcdbe94702d2e5",
        },
        {
          url: "/playground/api-icon_reimagine.png",
          revision: "8f5c0c84505f926f4240f60e00c90763",
        },
        {
          url: "/playground/api-icon_remove-background.png",
          revision: "2858cefaa29025f8e3732559ffdafb89",
        },
        {
          url: "/playground/api-icon_remove-text.png",
          revision: "f66c16d22c5015885f109f4706e07c73",
        },
        {
          url: "/playground/api-icon_remove-watermark.png",
          revision: "21c7abcc5a40a53a986f75877e46bf6a",
        },
        {
          url: "/playground/api-icon_replace-background.png",
          revision: "7ebe8f79fd0bf72f76ff5b4444e4ae93",
        },
        {
          url: "/playground/api-icon_replace-object.png",
          revision: "222d5d197c2f345f9d32574b1f80f779",
        },
        {
          url: "/playground/api-icon_replace-sky.png",
          revision: "eb772f9584477afe5f148ce8c36e4500",
        },
        {
          url: "/playground/api-icon_restore-face.png",
          revision: "d04e39d683bd2f76923f43cc06cd0e11",
        },
        {
          url: "/playground/api-icon_txt2img.png",
          revision: "4e8412fda2aba922a463f9dc2725d107",
        },
        {
          url: "/playground/api-icon_txt2video.png",
          revision: "21f2c2ba8f8bd1dfc844bdb37c6ca505",
        },
        {
          url: "/playground/api-icon_upscale.png",
          revision: "ebe395f8f651374679718977009836c5",
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
        {
          url: "/product/audio/play.png",
          revision: "27a23e9f4c8e7edc96eaf4eb3b534eeb",
        },
        {
          url: "/product/audio/speech2txt-translate/input-Japanese.mp3",
          revision: "931c35acd8a2f2c9baf130dd3e474133",
        },
        {
          url: "/product/audio/speech2txt/input-En.mp3",
          revision: "c8f94b6626e90dde7f5487de7cd93e7a",
        },
        {
          url: "/product/audio/txt2speech/output-Antonio.mp3",
          revision: "60ee82b1c874dc6f60b070dcae9ab398",
        },
        {
          url: "/product/audio/txt2speech/output-Gemma.mp3",
          revision: "acbfcf08075dcc061a609b50fe38417c",
        },
        {
          url: "/product/audio/txt2speech/output-Victoria.mp3",
          revision: "9decbf38d91eed035beee8de343bbef1",
        },
        {
          url: "/product/audio/voice-cloning/ai.mp3",
          revision: "d285048d824d26589d41fd1d2d242759",
        },
        {
          url: "/product/audio/voice-cloning/original.mp3",
          revision: "c8c80db5e4a6ffcfcd376135b6566c44",
        },
        {
          url: "/product/novita-pipe.png",
          revision: "0ceb4ee6dfa67bd53cd47c419f697f03",
        },
        {
          url: "/product/novita-pipe_vertical.png",
          revision: "14fab2313e7695c934b5dd23a4916360",
        },
        {
          url: "/product/videos/video-magic-cut/clips/1.jpg",
          revision: "3b636055707c5f46c7aef46f9106d354",
        },
        {
          url: "/product/videos/video-magic-cut/clips/1.mp4",
          revision: "2a32b422a69809849878c8a177ea3b21",
        },
        {
          url: "/product/videos/video-magic-cut/clips/1.png",
          revision: "7f0e8cd08797353ee6e061b598ce72d0",
        },
        {
          url: "/product/videos/video-magic-cut/clips/10.jpg",
          revision: "56e44619f595224d7a69536363a72e88",
        },
        {
          url: "/product/videos/video-magic-cut/clips/10.mp4",
          revision: "8c367d957438f2e718287e5bcda834c5",
        },
        {
          url: "/product/videos/video-magic-cut/clips/11.jpg",
          revision: "f1454dbc241f437d485d36b8357d869c",
        },
        {
          url: "/product/videos/video-magic-cut/clips/11.mp4",
          revision: "2ce099ae7dd0816f2c15a6efcdddc077",
        },
        {
          url: "/product/videos/video-magic-cut/clips/2.jpg",
          revision: "8a21caf0c7f157b7fff83d70812aa2b0",
        },
        {
          url: "/product/videos/video-magic-cut/clips/2.mp4",
          revision: "c0e4967fb3307595f6f6e1ee1f64543f",
        },
        {
          url: "/product/videos/video-magic-cut/clips/3.jpg",
          revision: "57b34ef87e1da711c1e4ca2e0bee4705",
        },
        {
          url: "/product/videos/video-magic-cut/clips/3.mp4",
          revision: "b697bafd125659479df2b7ee1f5cd7ae",
        },
        {
          url: "/product/videos/video-magic-cut/clips/4.jpg",
          revision: "0134534ada55a5c76d62e1392736ab30",
        },
        {
          url: "/product/videos/video-magic-cut/clips/4.mp4",
          revision: "a2c63b848cebe54b73b0c59294d280fd",
        },
        {
          url: "/product/videos/video-magic-cut/clips/5.jpg",
          revision: "a65c4f9b9a8c9a934bb62c9567727baf",
        },
        {
          url: "/product/videos/video-magic-cut/clips/5.mp4",
          revision: "49d4c31d6978bc2ea9424f4126aa71a0",
        },
        {
          url: "/product/videos/video-magic-cut/clips/6.jpg",
          revision: "9846a1c1d7fe4675b5b4497600b2dce7",
        },
        {
          url: "/product/videos/video-magic-cut/clips/6.mp4",
          revision: "02824e1cf543984af46f2cbdadf9f5a5",
        },
        {
          url: "/product/videos/video-magic-cut/clips/7.jpg",
          revision: "2da091019259205d4315117e0bb33254",
        },
        {
          url: "/product/videos/video-magic-cut/clips/7.mp4",
          revision: "d197c733bc9046c1fbc8a461457739ce",
        },
        {
          url: "/product/videos/video-magic-cut/clips/8.jpg",
          revision: "bf3523f2ba941c2260a3175a23aad5b1",
        },
        {
          url: "/product/videos/video-magic-cut/clips/8.mp4",
          revision: "8e5c037e8cd0ecb8b7419d7e6012fa85",
        },
        {
          url: "/product/videos/video-magic-cut/clips/9.jpg",
          revision: "f279b5f28c1ea8dccca123827a116cb7",
        },
        {
          url: "/product/videos/video-magic-cut/clips/9.mp4",
          revision: "6ea7867702a80f75ad416f224d42a9eb",
        },
        {
          url: "/product/videos/video-magic-cut/origin.mp4",
          revision: "9b2d11305bf560c19c7ffe7c241d96a9",
        },
        {
          url: "/product/videos/video-merge-face/result.mp4",
          revision: "f0ec2f918e60db0e3095c7d4dcc4e1a6",
        },
        {
          url: "/product/videos/video-remove-object/origin.mp4",
          revision: "69f900b238f0cb8da8bfc71ecda467e6",
        },
        {
          url: "/product/videos/video-remove-object/result.mp4",
          revision: "fca9c0caf6e22417f59fe90bfc498e4c",
        },
        {
          url: "/product/videos/video-remove-subtitles/origin.mp4",
          revision: "332e01a8d904472ac1f732c32df40640",
        },
        {
          url: "/product/videos/video-remove-subtitles/result.mp4",
          revision: "ace42d102bb4209c507f8fd4d1106e95",
        },
        {
          url: "/product/videos/video-remove-watermark/origin.mp4",
          revision: "d6ce16a857fac0d34d5fe68500df42fa",
        },
        {
          url: "/product/videos/video-remove-watermark/result.mp4",
          revision: "9e2dcec4561c4f301ad2905fa3404ff9",
        },
        {
          url: "/product/videos/video-translate/origin.mp4",
          revision: "98d30faa6b1486d76f761e1005a55453",
        },
        {
          url: "/product/videos/video-translate/result.mp4",
          revision: "c28d0648405fb7403a25acaf06ac5e4b",
        },
        {
          url: "/product/videos/video-upscale/origin.mp4",
          revision: "4698eb6ef36abdfd8473ac115564ac7e",
        },
        {
          url: "/product/videos/video-upscale/result.mp4",
          revision: "b3340168e51614e46dd4dadea4385e17",
        },
        { url: "/robots.txt", revision: "83d31792251e664a6fa4c9938472dbd1" },
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
          url: "/sitemap-blog.xml",
          revision: "a3152d47d5e21b86591f916354926d21",
        },
        {
          url: "/sitemap-image.xml",
          revision: "0cdfe4e11cd19c7c9b4557a339593027",
        },
        {
          url: "/sitemap-page.xml",
          revision: "1df8474cbca429de180e32bdaebe9e0c",
        },
        { url: "/sitemap.xml", revision: "eeabe52257dc0f5187fc6a15d0b28946" },
        { url: "/stripe-4.png", revision: "988a0e0a83505b01d22de502519584c7" },
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
          revision: "6ed3c4df9363270f0ae9941ca4f68ff9",
        },
        {
          url: "/tools/img2img.webm",
          revision: "bdac9c3b16aec127513d2ea7d23d991f",
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
          revision: "76380319f63fa0a0ce18f1faf87ebf3c",
        },
        {
          url: "/tools/outpainting.webm",
          revision: "0adc22de295b0137b14c49ad631db8ea",
        },
        {
          url: "/tools/reimagine.mp4",
          revision: "55fbda676edbf605b0e75e18f0b0e7d0",
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
          revision: "36cb37d2eedd7e9de70a5d41daf9c603",
        },
        {
          url: "/tools/removewatermark.webm",
          revision: "f55982e6da7542cd8f440a2644dd7d84",
        },
        {
          url: "/tools/replacesky.mp4",
          revision: "cd1e836f942963b7c878c8cd477971d3",
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
          revision: "68e1c1374fc9960f66d631dab8da5baa",
        },
        {
          url: "/tools/upscaling.webm",
          revision: "cf7f90d42d7db1b786d282333310b082",
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
              response: i,
              event: a,
              state: c,
            }) =>
              i && "opaqueredirect" === i.type
                ? new Response(i.body, {
                    status: 200,
                    statusText: "OK",
                    headers: i.headers,
                  })
                : i,
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
        const i = e.pathname;
        return !i.startsWith("/api/auth/") && !!i.startsWith("/api/");
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
