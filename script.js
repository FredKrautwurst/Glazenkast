/*
 * De Glazenkast — everything the page does once it is on screen.
 *
 * Four small behaviours, in order: scroll reveals, parallax, the navigation
 * bar, and the lightbox. Nothing here is required to read the page; without
 * this file the <noscript> block in index.html unhides every reveal and the
 * page stands on its own.
 */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Scroll reveals ──────────────────────────────────────────────────
   * Flips data-shown on an element the first time it enters the viewport.
   * The CSS decides what that means — a rise, an image wipe, a rule drawing
   * itself — so one observer drives every kind of reveal.
   */

  var targets = document.querySelectorAll("[data-shown]");

  function showAll() {
    Array.prototype.forEach.call(targets, function (el) {
      el.setAttribute("data-shown", "true");
    });
  }

  if (reduced || typeof IntersectionObserver === "undefined") {
    showAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-shown", "true");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "-12% 0px -8% 0px", threshold: 0.01 }
    );

    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  }

  /* ── Parallax ────────────────────────────────────────────────────────
   * Drifts a full-bleed image against the scroll. `strength` is the share of
   * the container's height the image travels across a full viewport pass, so
   * the image is pulled past the frame just enough to never expose an edge.
   */

  if (!reduced) {
    Array.prototype.forEach.call(document.querySelectorAll(".parallax"), function (outer) {
      var inner = outer.querySelector(".parallax__inner");
      if (!inner) return;

      var strength = parseFloat(outer.getAttribute("data-strength")) || 0.1;
      var overscan = (strength * 100 * 2 + 2).toFixed(1) + "%";

      inner.style.top = "-" + overscan;
      inner.style.bottom = "-" + overscan;
      inner.style.height = "auto";

      var frame = 0;

      function update() {
        frame = 0;
        var rect = outer.getBoundingClientRect();
        var viewport = window.innerHeight;
        if (rect.bottom < -200 || rect.top > viewport + 200) return;

        // -1 when the block sits just below the fold, 1 when it has just left.
        var progress =
          (rect.top + rect.height / 2 - viewport / 2) / (viewport / 2 + rect.height / 2);
        var shift = -progress * strength * rect.height;
        inner.style.transform = "translate3d(0, " + shift.toFixed(2) + "px, 0)";
      }

      function onScroll() {
        if (frame) return;
        frame = window.requestAnimationFrame(update);
      }

      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    });
  }

  /* ── Navigation ──────────────────────────────────────────────────────
   * The bar sits in cream over the hero photograph, then settles onto a paper
   * bar once the hero is behind you.
   */

  var nav = document.querySelector(".nav");
  var menu = document.querySelector(".menu");

  if (nav) {
    var onNavScroll = function () {
      // Settle exactly when the hero's lower edge reaches the bar, so cream
      // type never ends up sitting on paper.
      var settled = window.scrollY > window.innerHeight - 96;
      nav.setAttribute("data-settled", settled ? "true" : "false");
    };
    onNavScroll();
    window.addEventListener("scroll", onNavScroll, { passive: true });
    window.addEventListener("resize", onNavScroll);
  }

  if (menu) {
    var setMenu = function (open) {
      menu.setAttribute("data-open", open ? "true" : "false");
      root.classList.toggle("is-locked", open);
    };

    var opener = document.querySelector("[data-menu-open]");
    if (opener) opener.addEventListener("click", function () { setMenu(true); });

    menu.addEventListener("click", function (event) {
      // Closes on the close button and on any of the menu's own links.
      if (event.target.closest("[data-menu-close], a")) setMenu(false);
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.getAttribute("data-open") === "true") setMenu(false);
    });
  }

  /* ── Lightbox ────────────────────────────────────────────────────────
   * Every photograph tagged with the same data-gallery forms one set, in the
   * order it appears in the page.
   */

  var lightbox = document.querySelector(".lightbox");

  if (lightbox) {
    var view = lightbox.querySelector("[data-lightbox-image]");
    var caption = lightbox.querySelector("[data-lightbox-caption]");
    var counter = lightbox.querySelector("[data-lightbox-count]");
    var closeButton = lightbox.querySelector("[data-lightbox-close]");

    var groups = {};
    var triggers = document.querySelectorAll("[data-gallery]");

    Array.prototype.forEach.call(triggers, function (button) {
      var key = button.getAttribute("data-gallery");
      if (!groups[key]) groups[key] = [];
      groups[key].push(button);
    });

    var active = null;   // the array of buttons currently on show
    var index = 0;
    var restoreFocusTo = null;

    var pad = function (n) { return String(n).padStart(2, "0"); };

    function render() {
      var image = active[index].querySelector("img");
      view.src = image.currentSrc || image.src;
      view.alt = image.alt;
      caption.textContent = image.alt;
      counter.textContent = pad(index + 1) + " / " + pad(active.length);
      lightbox.setAttribute("aria-label", image.alt);
    }

    function open(group, at, trigger) {
      active = group;
      index = at;
      restoreFocusTo = trigger || null;
      render();
      lightbox.setAttribute("data-open", "true");
      root.classList.add("is-locked");
      if (closeButton) closeButton.focus();
    }

    function close() {
      lightbox.setAttribute("data-open", "false");
      root.classList.remove("is-locked");
      active = null;
      if (restoreFocusTo) restoreFocusTo.focus();
      restoreFocusTo = null;
    }

    function step(direction) {
      if (!active) return;
      index = (index + direction + active.length) % active.length;
      render();
    }

    Array.prototype.forEach.call(triggers, function (button) {
      button.addEventListener("click", function () {
        var group = groups[button.getAttribute("data-gallery")];
        open(group, group.indexOf(button), button);
      });
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target.closest("[data-lightbox-prev]")) return step(-1);
      if (event.target.closest("[data-lightbox-next]")) return step(1);
      // Anything outside the photograph and its caption dismisses.
      if (!event.target.closest(".lightbox__stage, .lightbox__foot")) close();
    });

    window.addEventListener("keydown", function (event) {
      if (lightbox.getAttribute("data-open") !== "true") return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    });
  }
})();
