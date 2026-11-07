/* ═══════════════════════════════════════════════════════════════════
   ECP LTD. — SHARED INTERACTIVITY (MOBILE NAV, TABS, PROJECT FILTERS)
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Mobile Navigation Toggle
  var mobileNav = document.getElementById("mobilenav");
  var openBtn = document.querySelector(".menu-toggle");
  var closeBtn = document.querySelector(".menu-close");

  if (openBtn && mobileNav) {
    openBtn.addEventListener("click", function () {
      mobileNav.classList.add("open");
    });
  }
  if (closeBtn && mobileNav) {
    closeBtn.addEventListener("click", function () {
      mobileNav.classList.remove("open");
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav && mobileNav.classList.contains("open")) {
      mobileNav.classList.remove("open");
    }
  });

  // 2. Accessible Service Tabs (with URL hash support)
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs [role="tab"]'));
  if (tabs.length > 0) {
    function selectTab(tab) {
      tabs.forEach(function (t) {
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        var isSelected = t === tab;
        t.setAttribute("aria-selected", isSelected ? "true" : "false");
        if (panel) panel.hidden = !isSelected;
      });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        selectTab(t);
      });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus();
        selectTab(next);
      });
    });

    var hash = window.location.hash.replace("#", "");
    if (hash) {
      var matchingTab = document.getElementById("t-" + hash);
      if (matchingTab) selectTab(matchingTab);
    }
  }

  // 3. Project Portfolio Category Filtering
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn[data-filter]"));
  var projCards = Array.prototype.slice.call(document.querySelectorAll(".proj-card[data-category]"));

  if (filterBtns.length > 0 && projCards.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        filterBtns.forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        projCards.forEach(function (card) {
          var cardCats = card.getAttribute("data-category") || "";
          var show = cat === "all" || cardCats.indexOf(cat) !== -1;
          card.hidden = !show;
        });
      });
    });
  }
});
