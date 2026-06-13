(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  let lastScroll = window.scrollY;

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    document.body.classList.toggle("menu-open", open);
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      setMenu(open);
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  function updateHeader() {
    if (!header) return;
    const current = window.scrollY;
    const scrollingDown = current > lastScroll && current > 120;
    header.classList.toggle("header-hidden", scrollingDown && !document.body.classList.contains("menu-open"));
    header.classList.toggle("header-scrolled", current > 12);
    lastScroll = Math.max(current, 0);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  document.querySelectorAll(".hero").forEach((hero) => {
    hero.addEventListener("pointermove", (event) => {
      if (prefersReduced) return;
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      hero.style.setProperty("--pointer-x", `${Math.round(x * 100)}%`);
      hero.style.setProperty("--pointer-y", `${Math.round(y * 100)}%`);
      hero.style.setProperty("--pointer-x-num", x.toFixed(3));
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((node) => revealObserver.observe(node));
  } else {
    reveals.forEach((node) => node.classList.add("is-visible"));
  }

  const counters = document.querySelectorAll("[data-counter]");
  function animateCounter(counter) {
    if (counter.dataset.counted === "true") return;
    counter.dataset.counted = "true";
    const target = Number(counter.dataset.target || "0");
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    if (prefersReduced) {
      counter.textContent = String(target);
    } else {
      requestAnimationFrame(tick);
    }
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.45 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  function validateForm(form) {
    const status = form.querySelector(".form-status");
    const fields = Array.from(form.querySelectorAll("input, textarea"));
    let valid = true;

    fields.forEach((field) => {
      field.classList.remove("is-invalid");
      const requiredEmpty = field.hasAttribute("required") && !field.value.trim();
      const emailInvalid = field.type === "email" && field.value.trim() && !field.validity.valid;

      if (requiredEmpty || emailInvalid) {
        valid = false;
        field.classList.add("is-invalid");
      }
    });

    if (!status) return valid;
    status.classList.toggle("is-error", !valid);
    status.textContent = valid ? "Thank you." : "Please complete the required fields.";
    return valid;
  }

  document.querySelectorAll(".js-contact-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (validateForm(form)) form.reset();
    });

    form.addEventListener("input", (event) => {
      if (event.target instanceof HTMLElement) {
        event.target.classList.remove("is-invalid");
      }
    });
  });

  const videos = document.querySelectorAll("video");
  if (videos.length && "IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;
          if (entry.isIntersecting && !prefersReduced) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    videos.forEach((video) => videoObserver.observe(video));
  }

  const canvas = document.querySelector("[data-particle-canvas]");
  if (canvas instanceof HTMLCanvasElement && !prefersReduced) {
    const context = canvas.getContext("2d");
    const particles = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const targetCount = Math.min(92, Math.max(42, Math.floor(width / 18)));
      particles.length = 0;
      for (let index = 0; index < targetCount; index += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.7 + 0.55,
          alpha: Math.random() * 0.45 + 0.18
        });
      }
    }

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        context.beginPath();
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(123, 246, 255, ${p.alpha})`;
        context.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 120) {
            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(q.x, q.y);
            context.strokeStyle = `rgba(80, 180, 255, ${(1 - distance / 120) * 0.16})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(draw);
    }

    resizeCanvas();
    draw();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pagehide", () => cancelAnimationFrame(animationFrame));
  }
})();
