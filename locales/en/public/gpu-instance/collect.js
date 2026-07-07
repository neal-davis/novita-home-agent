!(function () {
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  if ("undefined" != typeof window) {
    var e = window.location.href;
    const l = /[?&]([^=&#]+)=([^=&]*)/g,
      i = ["login", "code", "token"];
    let o;
    for (; (o = l.exec(e)); ) {
      var t = decodeURIComponent(o[1]),
        n = decodeURIComponent(o[2]);
      if (!i.includes(t))
        try {
          localStorage.getItem(t) || localStorage.setItem(t, n);
          if (t == "utm_campaign") {
            var nArr = n.split("_");
            var v = nArr[nArr.length - 1];
            v = v ? (Number.isNaN(Number(v)) ? 1 : Number(v)) : 1;
            setCookie("utm_campaign", n, v);
          }
        } catch (o) {
          console.log("c-err", o);
        }
    }
  }
})();
