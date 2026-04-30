    (function () {
      'use strict';

      /* ===== LOADER ===== */
      var brandText = 'S.S. CLASSIC MOULD & DIES';
      var lb = document.getElementById('loaderBrand');
      brandText.split('').forEach(function (c, i) {
        var s = document.createElement('span');
        s.textContent = c === ' ' ? '\u00A0' : c;
        s.style.animationDelay = (i * 0.025) + 's';
        lb.appendChild(s);
      });
      document.body.style.overflow = 'hidden';

      /* Loader: minimum 2 seconds with progress bar, stays longer if frames still loading */
      var loaderMinTime = Date.now() + 2000;
      var framesReady = false;
      var loaderBar = document.querySelector('.loader-bar-fill');
      var loaderProgress = 0;
      var loaderTarget = 30; // fake target before frames load

      // Animate progress bar smoothly
      function updateLoaderBar() {
        if (loaderProgress >= 100) return;
        // Move fast to 70% (fake), then slow until frames ready, then jump to 100%
        if (!framesReady && loaderProgress < 70) {
          loaderProgress += (70 - loaderProgress) * 0.04;
        } else if (!framesReady) {
          loaderProgress += (90 - loaderProgress) * 0.005;
        } else {
          loaderProgress += (100 - loaderProgress) * 0.15;
        }
        if (loaderBar) loaderBar.style.width = Math.min(loaderProgress, 100) + '%';
        if (loaderProgress < 99.5) requestAnimationFrame(updateLoaderBar);
      }
      requestAnimationFrame(updateLoaderBar);

      function dismissLoader() {
        framesReady = true;
        loaderProgress = 85; // jump near end
        var remaining = loaderMinTime - Date.now();
        if (remaining > 0) {
          setTimeout(doHideLoader, remaining);
        } else {
          doHideLoader();
        }
      }

      function doHideLoader() {
        document.getElementById('loader').classList.add('hidden');
        document.body.style.overflow = '';
      }

      /* Safety: force dismiss after 8 seconds no matter what */
      setTimeout(function () { doHideLoader(); }, 8000);

      /* ===== SCROLLYTELLING HERO CANVAS ===== */
      var TOTAL_FRAMES = 241;
      var canvas = document.getElementById('heroCanvas');
      var ctx = canvas.getContext('2d');
      var heroContainer = document.getElementById('hero-scroll-container');
      var heroWrap = document.getElementById('hero-canvas-wrap');
      var frames = [];
      var currentFrame = 0;
      var scrollHint = document.getElementById('scrollHint');

      function getIsPortrait() {
        return window.matchMedia('(max-aspect-ratio: 1/1)').matches || window.innerWidth <= 768;
      }
      var isPortrait = getIsPortrait();
      var desktopFrames = [];
      var mobileFrames = [];
      var desktopLoadedCount = 0;
      var mobileLoadedCount = 0;

      function loadFrameSet(folder, targetArr, isMobile) {
        for (var i = 0; i < TOTAL_FRAMES; i++) { targetArr.push(null); }
        function loadFrame(index) {
          if (targetArr[index] && targetArr[index].src) return;
          var img = new Image();
          img.src = folder + 'ezgif-frame-' + String(index + 1).padStart(3, '0') + '.jpg';
          img.onload = function () {
            if (isMobile) mobileLoadedCount++; else desktopLoadedCount++;
            var count = isMobile ? mobileLoadedCount : desktopLoadedCount;
            if (count === 1) resizeCanvas();
            // Draw frame 0 the moment it's available so the hero is never empty.
            if (index === 0) drawFrame(0);
            if (count >= 30) dismissLoader();
          };
          img.onerror = function () {
            if (isMobile) mobileLoadedCount++; else desktopLoadedCount++;
            var count = isMobile ? mobileLoadedCount : desktopLoadedCount;
            if (count >= 30) dismissLoader();
          };
          targetArr[index] = img;
        }
        for (var i = 0; i < Math.min(30, TOTAL_FRAMES); i++) { loadFrame(i); }
        setTimeout(function () { for (var i = 30; i < TOTAL_FRAMES; i += 8) { loadFrame(i); } }, 100);
        setTimeout(function () { for (var i = 0; i < TOTAL_FRAMES; i++) { loadFrame(i); } }, 500);
      }

      // Frames served locally from /public — Next.js exposes them at root
      var FRAMES_DESKTOP = '/frames/';
      var FRAMES_MOBILE = '/frames-mobile/';

      function preloadFrames() {
        if (getIsPortrait()) {
          loadFrameSet(FRAMES_MOBILE, mobileFrames, true);
          frames = mobileFrames;
        } else {
          loadFrameSet(FRAMES_DESKTOP, desktopFrames, false);
          frames = desktopFrames;
        }
      }

      function updateFrameSet() {
        var nowPortrait = getIsPortrait();
        if (nowPortrait !== isPortrait) {
          isPortrait = nowPortrait;
          if (isPortrait && mobileFrames.length === 0) {
            loadFrameSet(FRAMES_MOBILE, mobileFrames, true);
          } else if (!isPortrait && desktopFrames.length === 0) {
            loadFrameSet(FRAMES_DESKTOP, desktopFrames, false);
          }
          frames = isPortrait ? mobileFrames : desktopFrames;
          drawFrame(currentFrame);
        }
      }

      function resizeCanvas() {
        var dpr = window.devicePixelRatio || 1;
        var w = heroWrap.clientWidth;
        var h = heroWrap.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        drawFrame(currentFrame);
      }
      window.addEventListener('resize', function () { updateFrameSet(); resizeCanvas(); });

      function drawFrame(index) {
        index = Math.max(0, Math.min(index, TOTAL_FRAMES - 1));
        var img = frames[index];
        if (img && img.complete && img.naturalWidth > 0) {
          var cw = heroWrap.clientWidth, ch = heroWrap.clientHeight;
          var iw = img.naturalWidth, ih = img.naturalHeight;
          var isPortrait = cw < ch;
          // Portrait (mobile): contain — show full image, black bars on sides
          // Landscape (desktop): cover — fill entire screen
          var scale = isPortrait ? Math.min(cw / iw, ch / ih) : Math.max(cw / iw, ch / ih);
          var dw = iw * scale, dh = ih * scale;
          var dx = (cw - dw) / 2, dy = (ch - dh) / 2;
          ctx.fillStyle = '#0B0F12';
          ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, dx, dy, dw, dh);
          currentFrame = index;
        }
      }

      function onHeroScroll() {
        var rect = heroContainer.getBoundingClientRect();
        var scrollableHeight = heroContainer.offsetHeight - window.innerHeight;
        var scrolled = -rect.top;
        var progress = Math.max(0, Math.min(scrolled / scrollableHeight, 1));
        var frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
        if (frameIndex !== currentFrame) drawFrame(frameIndex);
        if (scrollHint) {
          scrollHint.style.opacity = progress > 0.05 ? '0' : '1';
        }
      }

      preloadFrames();

      /* ===== THEME ===== */
      var html = document.documentElement;
      var stored = localStorage.getItem('ss-theme');
      if (stored) html.setAttribute('data-theme', stored);
      function toggleTheme() {
        var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('ss-theme', next);
      }
      document.getElementById('themeToggle').addEventListener('click', toggleTheme);
      document.getElementById('themeToggleMobile').addEventListener('click', toggleTheme);
      function checkMobileToggle() { document.getElementById('themeToggleMobile').style.display = window.innerWidth <= 768 ? 'flex' : 'none'; }
      checkMobileToggle(); window.addEventListener('resize', checkMobileToggle);

      /* ===== CURSOR ===== */
      var dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing');
      var mx = 0, my = 0, rx = 0, ry = 0;
      if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) {
        document.body.classList.add('cursor-active');
        document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
        (function anim() { rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(anim); })();
        document.querySelectorAll('a,button,input,textarea,select,.bento-card,.bento-gallery-item,.theme-toggle').forEach(function (el) {
          el.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
          el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
        });
      }

      /* ===== SCROLL HANDLERS (merged + rAF-throttled) ===== */
      var pb = document.getElementById('scrollProgress'), nav = document.getElementById('navbar'), btt = document.getElementById('backToTop');
      var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]:not(.btn-cta)');
      var navSections = [];
      navAnchors.forEach(function (a) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) navSections.push({ el: target, link: a });
      });
      var scrollTicking = false;
      function onScroll() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(function () {
          var st = window.scrollY, dh = document.documentElement.scrollHeight - window.innerHeight;
          pb.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
          nav.classList.toggle('scrolled', st > 60);
          btt.classList.toggle('visible', st > 600);
          onHeroScroll();
          var scrollY = st + window.innerHeight * 0.3;
          var active = null;
          navSections.forEach(function (s) { if (s.el.offsetTop <= scrollY) active = s; });
          navAnchors.forEach(function (a) { a.classList.remove('active-link'); });
          if (active) active.link.classList.add('active-link');
          scrollTicking = false;
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

      /* ===== LANGUAGE SELECTOR (cookie-based, reliable) ===== */
      var langWrap = document.getElementById('langWrap');
      var langBtn = document.getElementById('langBtn');
      var langLoading = document.getElementById('langLoading');

      langBtn.addEventListener('click', function () { langWrap.classList.toggle('open'); });
      document.addEventListener('click', function (e) { if (!langWrap.contains(e.target)) langWrap.classList.remove('open'); });

      // Set Google Translate cookie and reload — most reliable method
      function setGTLang(lang) {
        var domain = location.hostname;
        document.cookie = 'googtrans=/en/' + lang + ';path=/;domain=' + domain;
        document.cookie = 'googtrans=/en/' + lang + ';path=/';
      }

      // Load GT script
      var gtReady = false;
      function ensureGT(cb) {
        if (gtReady) { cb(); return; }
        var s = document.createElement('script');
        s.src = 'https://translate.google.com/translate_a/element.js?cb=_gtCb';
        document.head.appendChild(s);
        window._gtCb = function () {
          new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'gt-container');
          gtReady = true;
          cb();
        };
      }

      document.querySelectorAll('.lang-option').forEach(function (opt) {
        opt.addEventListener('click', function () {
          var lang = opt.getAttribute('data-lang');
          var flag = opt.getAttribute('data-flag');
          langBtn.innerHTML = '<span class="fi fi-' + flag + '"></span>';
          langWrap.classList.remove('open');
          langLoading.classList.add('active');

          if (lang === 'en') {
            // Reset to English — clear cookies and reload
            document.cookie = 'googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
            document.cookie = 'googtrans=;path=/;domain=' + location.hostname + ';expires=Thu, 01 Jan 1970 00:00:00 UTC';
            location.reload();
            return;
          }

          // Set cookie first, then load GT
          setGTLang(lang);
          ensureGT(function () {
            // Force the select to change
            var tries = 0;
            var iv = setInterval(function () {
              var sel = document.querySelector('.goog-te-combo');
              if (sel) {
                sel.value = lang;
                sel.dispatchEvent(new Event('change'));
                clearInterval(iv);
                setTimeout(function () { langLoading.classList.remove('active'); }, 800);
              }
              if (++tries > 30) {
                clearInterval(iv);
                // Fallback: reload with cookie set
                location.reload();
              }
            }, 150);
          });
        });
      });

      // Restore flag on page load if translated
      var savedLang = (document.cookie.match(/googtrans=\/en\/(\w+)/) || [])[1];
      if (savedLang) {
        var flagMap = { hi: 'in', ar: 'sa', 'zh-CN': 'cn', es: 'es', fr: 'fr', fil: 'ph', id: 'id', bn: 'bd' };
        var f = flagMap[savedLang];
        if (f) langBtn.innerHTML = '<span class="fi fi-' + f + '"></span>';
      }

      /* ===== HAMBURGER ===== */
      var hb = document.getElementById('hamburger'), mm = document.getElementById('mobileMenu');
      function closeMenu() {
        mm.classList.remove('open');
        hb.classList.remove('active');
        hb.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
      function toggleMenu() {
        var isOpen = mm.classList.toggle('open');
        hb.classList.toggle('active');
        hb.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      }
      hb.addEventListener('click', toggleMenu);
      mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
      document.getElementById('mobileMenuClose').addEventListener('click', closeMenu);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mm.classList.contains('open')) closeMenu(); });

      /* ===== MOBILE LANGUAGE BUTTONS ===== */
      document.querySelectorAll('#mobileLangRow button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var lang = btn.getAttribute('data-lang');
          var flag = btn.getAttribute('data-flag');
          // Update desktop lang button too
          langBtn.innerHTML = '<span class="fi fi-' + flag + '"></span>';
          // Highlight active
          document.querySelectorAll('#mobileLangRow button').forEach(function (b) { b.classList.remove('active-lang'); });
          btn.classList.add('active-lang');
          closeMenu();

          if (lang === 'en') {
            document.cookie = 'googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
            document.cookie = 'googtrans=;path=/;domain=' + location.hostname + ';expires=Thu, 01 Jan 1970 00:00:00 UTC';
            location.reload();
            return;
          }
          setGTLang(lang);
          langLoading.classList.add('active');
          ensureGT(function () {
            var tries = 0;
            var iv = setInterval(function () {
              var sel = document.querySelector('.goog-te-combo');
              if (sel) { sel.value = lang; sel.dispatchEvent(new Event('change')); clearInterval(iv); setTimeout(function () { langLoading.classList.remove('active'); }, 800); }
              if (++tries > 30) { clearInterval(iv); location.reload(); }
            }, 150);
          });
        });
      });

      // Highlight active lang on mobile too
      if (savedLang) {
        var mobileFlagMap = { en: 'gb', hi: 'in', ar: 'sa', 'zh-CN': 'cn', es: 'es', fr: 'fr', fil: 'ph', id: 'id', bn: 'bd' };
        document.querySelectorAll('#mobileLangRow button').forEach(function (b) {
          if (b.getAttribute('data-lang') === savedLang) b.classList.add('active-lang');
        });
      }
      /* Close mobile menu on resize past breakpoint */
      var wasMobile = window.innerWidth <= 768;
      window.addEventListener('resize', function () {
        var isMobile = window.innerWidth <= 768;
        if (wasMobile && !isMobile && mm.classList.contains('open')) closeMenu();
        wasMobile = isMobile;
      });

      /* ===== FAQ ACCORDION ===== */
      document.querySelectorAll('.faq-question').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.parentElement;
          var isOpen = item.classList.contains('open');
          document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
          if (!isOpen) item.classList.add('open');
        });
      });

      /* ===== INTERSECTION OBSERVER ===== */
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
      document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(function (el) { obs.observe(el); });

      /* ===== COUNTER ANIMATION ===== */
      var counterObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var el = e.target;
            var target = parseInt(el.getAttribute('data-count'), 10);
            var suffix = el.getAttribute('data-suffix') || '';
            var duration = target > 1000 ? 2000 : 1500;
            var startTime = null;

            function easeOutExpo(t) {
              return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            }

            function animate(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              var current = Math.floor(easeOutExpo(progress) * target);
              if (target >= 1000) {
                el.textContent = current.toLocaleString() + suffix;
              } else {
                el.textContent = current + suffix;
              }
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                if (target >= 1000) {
                  el.textContent = target.toLocaleString() + suffix;
                } else {
                  el.textContent = target + suffix;
                }
              }
            }
            requestAnimationFrame(animate);
            counterObs.unobserve(el);
          }
        });
      }, { threshold: 0.3 });
      document.querySelectorAll('[data-count]').forEach(function (el) { counterObs.observe(el); });

      /* ===== GALLERY FILTERS ===== */
      var filters = document.querySelectorAll('.gallery-filter');
      var bentoItems = document.querySelectorAll('[data-category]');

      function applyFilter(cat) {
        bentoItems.forEach(function (item) {
          if (cat === 'all' || item.getAttribute('data-category') === cat) {
            item.classList.remove('hidden-by-filter');
          } else {
            item.classList.add('hidden-by-filter');
          }
        });
        rebuildLightboxItems();
      }
      filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filters.forEach(function (f) { f.classList.remove('active'); });
          btn.classList.add('active');
          applyFilter(btn.getAttribute('data-filter'));
        });
      });
      applyFilter('lifestyle');

      /* ===== LIGHTBOX (filter-aware) ===== */
      var lightbox = document.getElementById('lightbox');
      var lbImg = document.getElementById('lightboxImg');
      var lbCaption = document.getElementById('lightboxCaption');
      var lbVisibleItems = [];
      var lbIndex = 0;

      function rebuildLightboxItems() {
        lbVisibleItems = [];
        bentoItems.forEach(function (item) {
          if (!item.classList.contains('hidden-by-filter')) {
            lbVisibleItems.push({
              src: item.getAttribute('data-src'),
              title: (item.querySelector('.bento-title') || {}).textContent || '',
              caption: (item.querySelector('.bento-caption') || {}).textContent || ''
            });
          }
        });
      }

      function getVisibleIndex(item) {
        var idx = 0;
        for (var i = 0; i < bentoItems.length; i++) {
          if (bentoItems[i].classList.contains('hidden-by-filter')) continue;
          if (bentoItems[i] === item) return idx;
          idx++;
        }
        return 0;
      }

      bentoItems.forEach(function (item) {
        function openHandler() { openLightbox(getVisibleIndex(item)); }
        item.addEventListener('click', openHandler);
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHandler(); }
        });
      });

      function setLightboxContent(i) {
        if (!lbVisibleItems[i]) return;
        var alt = lbVisibleItems[i].title + (lbVisibleItems[i].caption ? ' — ' + lbVisibleItems[i].caption : '');
        lbImg.src = lbVisibleItems[i].src;
        lbImg.alt = alt;
        lbCaption.textContent = alt;
      }
      function openLightbox(i) {
        lbIndex = i;
        setLightboxContent(i);
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }
      function navLightbox(dir) {
        if (lbVisibleItems.length === 0) return;
        lbIndex = (lbIndex + dir + lbVisibleItems.length) % lbVisibleItems.length;
        setLightboxContent(lbIndex);
      }
      document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
      document.getElementById('lightboxPrev').addEventListener('click', function () { navLightbox(-1); });
      document.getElementById('lightboxNext').addEventListener('click', function () { navLightbox(1); });
      lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
      document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navLightbox(-1);
        if (e.key === 'ArrowRight') navLightbox(1);
      });
      rebuildLightboxItems();

      /* ===== FORM — WhatsApp redirect ===== */
      var form = document.getElementById('contactForm'), success = document.getElementById('formSuccess');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('.btn-submit');
        btn.textContent = 'Sending...';
        btn.disabled = true;
        var fd = new FormData(form);
        var payload = {
          name: (fd.get('name') || '').toString().trim(),
          company: (fd.get('company') || '').toString().trim(),
          email: (fd.get('email') || '').toString().trim(),
          phone: (fd.get('phone') || '').toString().trim(),
          product: (fd.get('product') || '').toString().trim(),
          message: (fd.get('message') || '').toString().trim(),
          website: (fd.get('website') || '').toString() // honeypot — humans leave blank
        };
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; });
          })
          .then(function (r) {
            if (r.ok && r.data && r.data.success) {
              var summary = document.getElementById('enquirySummary');
              if (summary) {
                summary.innerHTML = '';
                var rows = [
                  ['Name', payload.name],
                  ['Company', payload.company],
                  ['Email', payload.email],
                  ['Phone', payload.phone],
                  ['Product', payload.product],
                  ['Message', payload.message]
                ];
                rows.forEach(function (pair) {
                  if (!pair[1]) return;
                  var labelEl = document.createElement('span');
                  labelEl.className = 'form-success-label';
                  labelEl.textContent = pair[0];
                  var valEl = document.createElement('span');
                  valEl.className = 'form-success-value';
                  valEl.textContent = pair[1];
                  var rowEl = document.createElement('div');
                  rowEl.className = 'form-success-row';
                  rowEl.appendChild(labelEl);
                  rowEl.appendChild(valEl);
                  summary.appendChild(rowEl);
                });
              }
              form.style.display = 'none';
              success.classList.add('show');
            } else {
              btn.textContent = 'Failed — Try Again';
              btn.disabled = false;
            }
          })
          .catch(function () {
            btn.textContent = 'Network Error — Try Again';
            btn.disabled = false;
          });
      });

      /* Form reset */
      document.getElementById('formReset').addEventListener('click', function () {
        form.reset();
        form.style.display = '';
        success.classList.remove('show');
        var summary = document.getElementById('enquirySummary');
        if (summary) summary.innerHTML = '';
        var btn = form.querySelector('.btn-submit');
        btn.textContent = 'Send Enquiry';
        btn.disabled = false;
      });

    })();
