/* Наталия Матасова - лендинг. Тема, навигация, reveal, форма -> amo.php */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---- Тема ---- */
  var THEME_KEY = "nm-theme";
  function applyTheme(t) { root.setAttribute("data-theme", t); }
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
  } catch (e) {}
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      if (!cur) cur = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var next = cur === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---- Sticky header тень ---- */
  var head = document.getElementById("siteHead");
  function onScroll() { if (head) head.classList.toggle("is-stuck", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Мобильное меню ---- */
  var sheet = document.getElementById("sheet");
  var burger = document.getElementById("burger");
  var sheetClose = document.getElementById("sheetClose");
  function closeSheet() { if (sheet) sheet.classList.remove("open"); }
  if (burger) burger.addEventListener("click", function () { sheet.classList.add("open"); });
  if (sheetClose) sheetClose.addEventListener("click", closeSheet);
  if (sheet) sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });
  Array.prototype.forEach.call(document.querySelectorAll(".sheet-panel a"), function (a) {
    a.addEventListener("click", closeSheet);
  });

  /* ---- Reveal ---- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    Array.prototype.forEach.call(items, function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + "ms";
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(items, function (el) { el.classList.add("in"); });
  }

  /* ---- Карусели (направления + дипломы) ---- */
  function carousel(cfg) {
    var track = document.getElementById(cfg.track);
    if (!track) return;
    var vp = track.parentElement;
    var prev = document.getElementById(cfg.prev);
    var next = document.getElementById(cfg.next);
    var dotsC = document.getElementById(cfg.dots);
    var n = track.children.length, i = 0;
    function maxSc() { return Math.max(0, track.scrollWidth - vp.clientWidth); }
    function target(k) { return Math.min(track.children[k].offsetLeft, maxSc()); }
    function render() {
      track.style.transform = "translateX(-" + target(i) + "px)";
      if (dotsC) Array.prototype.forEach.call(dotsC.children, function (d, k) { d.classList.toggle("active", k === i); });
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = target(i) >= maxSc() - 1;
    }
    function go(k) { i = Math.max(0, Math.min(n - 1, k)); render(); }
    if (dotsC) {
      for (var d = 0; d < n; d++) {
        (function (k) {
          var b = document.createElement("button");
          b.type = "button"; b.setAttribute("aria-label", "Слайд " + (k + 1));
          b.addEventListener("click", function () { go(k); });
          dotsC.appendChild(b);
        })(d);
      }
    }
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    if (next) next.addEventListener("click", function () { go(i + 1); });
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(render, 150); }, { passive: true });
    render();
  }
  carousel({ track: "specTrack", prev: "specPrev", next: "specNext", dots: "specDots" });
  carousel({ track: "dipTrack", prev: "dipPrev", next: "dipNext", dots: "dipDots" });
  carousel({ track: "resTrack", prev: "resPrev", next: "resNext", dots: "resDots" });

  /* ---- Бесконечная лента отзывов (клонируем для бесшовности) ---- */
  var tstTrack = document.getElementById("tstTrack");
  if (tstTrack && !tstTrack.dataset.cloned) {
    var originals = Array.prototype.slice.call(tstTrack.children);
    originals.forEach(function (node) {
      var c = node.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      tstTrack.appendChild(c);
    });
    tstTrack.dataset.cloned = "1";
  }

  /* ---- Модальное окно заявки ---- */
  var form = document.getElementById("leadForm");
  var modal = document.getElementById("leadModal");
  var lastFocus = null;
  function openModal(leadType) {
    if (!modal) return;
    if (leadType && form) {
      var input = form.querySelector('input[name="lead_type"][value="' + leadType + '"]');
      if (input) input.checked = true;
    }
    lastFocus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var first = modal.querySelector("#f-name");
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-lead]"), function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(a.getAttribute("data-lead"));
    });
  });
  if (modal) {
    Array.prototype.forEach.call(modal.querySelectorAll("[data-modal-close]"), function (el) {
      el.addEventListener("click", closeModal);
    });
    var mClose = document.getElementById("modalClose");
    if (mClose) mClose.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---- Отправка формы ---- */
  if (form) {
    var msg = document.getElementById("formMsg");
    var submitBtn = document.getElementById("leadSubmit");

    function setMsg(kind, text) { msg.className = "form-msg " + kind; msg.textContent = text; }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var ok = true;
      form.querySelector("#f-name").classList.toggle("invalid", name === "");
      form.querySelector("#f-phone").classList.toggle("invalid", phone.replace(/\D/g, "").length < 10);
      if (name === "") ok = false;
      if (phone.replace(/\D/g, "").length < 10) ok = false;
      if (!ok) { setMsg("err", "Пожалуйста, заполните имя и корректный телефон."); return; }

      var leadType = (form.querySelector('input[name="lead_type"]:checked') || {}).value || "free";
      var topics = Array.prototype.map.call(
        form.querySelectorAll('input[name="topics"]:checked'), function (c) { return c.value; }
      ).join(", ");

      var payload = {
        name: name,
        phone: phone,
        contact: form.contact.value,
        goal: form.goal.value.trim(),
        topics: topics,
        lead_type: leadType,
        website: form.website.value,
        page: location.href
      };

      submitBtn.disabled = true;
      var oldText = submitBtn.textContent;
      submitBtn.textContent = "Отправляем...";
      setMsg("", "");

      fetch("amo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && res.j && res.j.ok) {
            form.reset();
            setMsg("ok", "Заявка отправлена. Я свяжусь с вами в ближайшее время, будьте на связи.");
            if (window.ym && window.NM_METRIKA_ID) window.ym(window.NM_METRIKA_ID, "reachGoal", "lead_sent");
          } else {
            setMsg("err", "Не удалось отправить. Напишите мне напрямую или попробуйте позже.");
          }
        })
        .catch(function () {
          setMsg("err", "Ошибка сети. Проверьте соединение и попробуйте еще раз.");
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = oldText;
        });
    });
  }
})();
