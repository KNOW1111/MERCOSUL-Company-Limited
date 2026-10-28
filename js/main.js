// Mercosul Company Limited — site interactions
(function () {
  "use strict";

  // Sticky header
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("open");
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.classList.remove("open");
        nav.classList.remove("open");
      });
    });
  }

  // Scroll reveal
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });

  // Number count-up for stats
  var counters = document.querySelectorAll("[data-count]");
  var cObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        cObserver.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1400;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach(function (c) { cObserver.observe(c); });

  // Catalog viewer modal — page-by-page image gallery with PDF download
  var modal = document.getElementById("pdf-modal");
  if (modal) {
    var frame = document.getElementById("pdf-modal-frame");
    var pageImg = document.getElementById("pdf-page-img");
    var titleEl = document.getElementById("pdf-modal-title");
    var dl = document.getElementById("pdf-modal-download");
    var counter = document.getElementById("pdf-page-counter");
    var prevBtn = document.getElementById("pdf-prev");
    var nextBtn = document.getElementById("pdf-next");
    var CATALOG = window.CATALOG_PAGES || {};
    var gallery = null; // {pages:[], idx:0}

    function showPage() {
      if (!gallery) return;
      pageImg.src = gallery.pages[gallery.idx];
      counter.textContent = (gallery.idx + 1) + " / " + gallery.pages.length;
      prevBtn.disabled = gallery.idx === 0;
      nextBtn.disabled = gallery.idx === gallery.pages.length - 1;
    }
    function openGallery(entry, title) {
      gallery = { pages: entry.pages, idx: 0 };
      titleEl.textContent = title;
      dl.href = entry.pdf;
      dl.setAttribute("download", "");
      frame.src = "";
      frame.style.display = "none";
      pageImg.style.display = "block";
      prevBtn.style.display = nextBtn.style.display = "block";
      counter.style.display = "inline";
      showPage();
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function openPdf(pdf, title) {
      gallery = null;
      titleEl.textContent = title;
      dl.href = pdf;
      dl.setAttribute("download", "");
      pageImg.src = "";
      pageImg.style.display = "none";
      frame.style.display = "block";
      frame.src = pdf;
      prevBtn.style.display = nextBtn.style.display = "none";
      counter.style.display = "none";
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      frame.src = "";
      pageImg.src = "";
      gallery = null;
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-catalog]").forEach(function (el) {
      el.addEventListener("click", function () {
        var slug = el.getAttribute("data-catalog");
        var entry = CATALOG[slug];
        if (entry) openGallery(entry, entry.title);
      });
    });
    document.querySelectorAll("[data-pdf]").forEach(function (el) {
      el.addEventListener("click", function () {
        openPdf(el.getAttribute("data-pdf"), el.getAttribute("data-title") || "Catalog");
      });
    });

    prevBtn.addEventListener("click", function () {
      if (gallery && gallery.idx > 0) { gallery.idx--; showPage(); }
    });
    nextBtn.addEventListener("click", function () {
      if (gallery && gallery.idx < gallery.pages.length - 1) { gallery.idx++; showPage(); }
    });

    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft" && gallery) prevBtn.click();
      if (e.key === "ArrowRight" && gallery) nextBtn.click();
    });
  }

  // Contact form (front-end demo: validates and shows success)
  var form = document.getElementById("inquiry-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = document.getElementById("form-status");
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      var ok = true;
      if (!name) ok = false;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;
      if (!msg) ok = false;
      if (!ok) {
        status.className = "form-status err";
        status.textContent = "Please fill in your name, a valid email and a message.";
        return;
      }
      status.className = "form-status ok";
      status.textContent = "Thank you! Your inquiry has been sent — our team will get back to you within 24 hours.";
      form.reset();
    });
  }
})();
