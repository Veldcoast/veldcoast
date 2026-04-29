/* ============================================
   VELDCOAST — Landing Page Scripts
   ============================================ */

(function () {
  'use strict';

  // --- Scroll Reveal via IntersectionObserver ---

  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      revealElements.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      observer.observe(el);
    });
  }

  // --- Navbar scroll state ---

  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var scrollThreshold = 50;

    function onScroll() {
      if (window.scrollY > scrollThreshold) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile nav toggle ---

  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });
  }

  // --- Hero mouse-follow glow ---

  function initHeroGlow() {
    var hero = document.getElementById('hero');
    var glow = document.getElementById('hero-glow');
    if (!hero || !glow) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return;

    hero.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';
    });

    hero.addEventListener('mouseleave', function () {
      glow.style.opacity = '0';
    });
  }

  // --- Blueprint grid canvas ---

  function initBlueprintCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width, height, cols, rows;
    var cellSize = 60;
    var dots = [];
    var mouse = { x: -1000, y: -1000 };
    var animId;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / cellSize) + 1;
      rows = Math.ceil(height / cellSize) + 1;
      dots = [];
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          dots.push({
            x: c * cellSize,
            y: r * cellSize,
            baseRadius: 1,
            radius: 1
          });
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.04)';
      ctx.lineWidth = 0.5;

      for (var c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellSize, 0);
        ctx.lineTo(c * cellSize, height);
        ctx.stroke();
      }

      for (var r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellSize);
        ctx.lineTo(width, r * cellSize);
        ctx.stroke();
      }

      // Dots at intersections with mouse proximity effect
      var influenceRadius = 150;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var dx = mouse.x - d.x;
        var dy = mouse.y - d.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var influence = Math.max(0, 1 - dist / influenceRadius);

        d.radius = d.baseRadius + influence * 3;
        var alpha = 0.15 + influence * 0.6;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(249, 115, 22, ' + alpha + ')';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function () {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    window.addEventListener('resize', debounce(function () {
      cancelAnimationFrame(animId);
      resize();
      draw();
    }, 200));

    resize();
    draw();
  }

  // --- Smooth anchor scrolling ---

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        var navHeight = document.getElementById('nav').offsetHeight;
        var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  // --- Utility: debounce ---

  function debounce(fn, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }

  // --- Init everything on DOMContentLoaded ---

  document.addEventListener('DOMContentLoaded', function () {
    initNavScroll();
    initMobileNav();
    initSmoothScroll();
    initRevealAnimations();
    initHeroGlow();
    initBlueprintCanvas();
  });

})();
