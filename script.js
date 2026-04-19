// ====== Seamless SPA Router ======
function updateNavSelection() {
  let currentPath = window.location.pathname.split('/').pop();
  if (!currentPath || currentPath === "") currentPath = "index.html";
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === currentPath) {
      item.classList.add('active');
    }
  });
}
document.addEventListener("DOMContentLoaded", updateNavSelection);

// Click Interceptor
document.addEventListener("click", async (e) => {
  const link = e.target.closest("a");
  if (!link || !link.href) return;

  // Ignore external links, new tabs, or PDFs
  if (link.origin !== window.location.origin) return;
  if (link.target === "_blank") return;
  if (link.getAttribute("href").startsWith("#")) return;
  if (link.hasAttribute("download") || link.href.toLowerCase().endsWith(".pdf")) return;

  e.preventDefault();
  const url = link.href;

  window.history.pushState({}, "", url);
  await loadPage(url);
});

// Browser Forward/Back Interceptor
window.addEventListener("popstate", async () => {
  await loadPage(window.location.href);
});

async function loadPage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response failed.");
    const htmlString = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract exactly the main content wrapper
    const newMain = doc.querySelector("main");
    const currentMain = document.querySelector("main");
    if (newMain && currentMain) {
       currentMain.replaceWith(newMain);
       if (typeof updateProjectDisplay === 'function' && document.querySelector('.project-grid')) {
         updateProjectDisplay();
       }
    }
    
    // Update Title and active nav state
    document.title = doc.title;
    updateNavSelection();
    
    // Generate new lab artifact on page change
    if (typeof generateLabArtifact === 'function') generateLabArtifact();

    // Scroll to top of new page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch(e) {
    // If testing locally on file:// where fetch is blocked by CORS, fallback to hard redirect
    console.warn("SPA Load Failed, executing hard navigation.", e);
    window.location.href = url;
  }
}

// ====== Theme Toggle + Persistence ======
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark');
}

// Toggle theme on button click
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });
}

// ====== Dynamic Year ======
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();


// ====== Custom Canvas Particles ======
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.getElementById("particles-js").appendChild(canvas);

let particles = [];
const numParticles = 90;
const maxDist = 140;
let mouse = { x: null, y: null };

// ===== Resize Canvas =====
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ===== Track Mouse =====
window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});
window.addEventListener("mouseout", () => {
  mouse.x = null;
  mouse.y = null;
});

// ===== Initialize Particles =====
function initParticles() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.4) * 0.4,  // moderate movement speed
      vy: (Math.random() - 0.4) * 0.4
    });
  }
}
initParticles();

// ===== Animate Particles =====
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isDark = body.classList.contains("dark");
  const color = isDark ? "#4da6ff" : "#0a6ebd";

  // Move and draw particles
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    // Bounce off edges
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Draw lines between nearby particles
  for (let i = 0; i < numParticles; i++) {
    for (let j = i + 1; j < numParticles; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 1 - dist / maxDist;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  // Draw lines from mouse to particles
  if (mouse.x && mouse.y) {
    for (let i = 0; i < numParticles; i++) {
      const dx = particles[i].x - mouse.x;
      const dy = particles[i].y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 1 - dist / maxDist;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(particles[i].x, particles[i].y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  requestAnimationFrame(animate);
}

// Start animation
animate();

// ====== Research Verification Carousel ======
const track = document.getElementById('carouselTrack');
const slides = Array.from(document.querySelectorAll('.carousel-slide'));
const dots = Array.from(document.querySelectorAll('.dot'));
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
let currentIdx = 0;
let slideInterval;

function updateCarousel() {
  if (!track) return;
  track.style.transform = `translateX(-${currentIdx * 100}%)`;
  
  slides.forEach((slide, i) => slide.classList.toggle('active', i === currentIdx));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIdx));
}

function nextSlide() {
  if (slides.length === 0) return;
  currentIdx = (currentIdx + 1) % slides.length;
  updateCarousel();
}

function prevSlide() {
  if (slides.length === 0) return;
  currentIdx = (currentIdx - 1 + slides.length) % slides.length;
  updateCarousel();
}

// Manual Controls
if (nextBtn) nextBtn.addEventListener('click', () => {
  nextSlide();
  resetTimer();
});

if (prevBtn) prevBtn.addEventListener('click', () => {
  prevSlide();
  resetTimer();
});

// Auto-slide logic with reset
function startTimer() {
  slideInterval = setInterval(nextSlide, 5000);
}

function resetTimer() {
  clearInterval(slideInterval);
  startTimer();
}

if (track && slides.length > 0) {
  startTimer();
}

// ====== Project Filtering & Sorting Logic ======
function updateProjectDisplay() {
  const ongoing = document.getElementById('filter-ongoing')?.checked ?? true;
  const completed = document.getElementById('filter-completed')?.checked ?? true;
  const grid = document.querySelector('.project-grid');
  const cards = Array.from(document.querySelectorAll('.project-card'));
  
  if (!grid || cards.length === 0) return;

  // 1. Filter
  cards.forEach(card => {
    const status = card.dataset.status;
    if (!status) return;
    const isVisible = (status === 'ongoing' && ongoing) || (status === 'completed' && completed);
    card.classList.toggle('filtered-out', !isVisible);
  });

  // 2. Sort (Ongoing First: priority 1 < 2)
  cards.sort((a, b) => {
    return (parseInt(a.dataset.priority) || 99) - (parseInt(b.dataset.priority) || 99);
  });

  // 3. Re-append to DOM in sorted order
  cards.forEach(card => grid.appendChild(card));
}

document.addEventListener('change', (e) => {
  if (e.target.classList.contains('filter-checkbox')) {
    updateProjectDisplay();
  }
});

// Initial sort on page load (especially for SPA navigation)
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.project-grid')) updateProjectDisplay();
  generateLabArtifact(); // Generate the dynamic logo on initial load
});

// ====== Generative Latent Space Engine (Interactive) ======

let mousePos = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

const activeArtifacts = [];

function generateLabArtifact() {
  const logoContainer = document.getElementById('dynamicLabLogo');
  const ambientContainer = document.getElementById('ambient-artifacts');

  // Clear existing animations
  activeArtifacts.length = 0;

  // --- 1. Top-Right Logo (Now Static Image - Block Removed) ---

  // --- 2. Ambient Background Shapes ---
  if (ambientContainer) {
    ambientContainer.innerHTML = '';
    const numArtifacts = 3;
    for (let i = 0; i < numArtifacts; i++) {
      const artifactWrap = document.createElement('div');
      artifactWrap.className = 'ambient-artifact';
      const size = Math.floor(Math.random() * 150 + 200);
      const canvas = createMathCanvas(size);
      
      artifactWrap.style.top = `${Math.random() * 80 + 5}%`;
      artifactWrap.style.left = `${Math.random() * 80 + 5}%`;
      artifactWrap.appendChild(canvas);
      ambientContainer.appendChild(artifactWrap);
      initLatentArtifact(canvas, 'ambient');
    }
  }
}

function createMathCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.className = 'math-artifact';
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  return canvas;
}

function initLatentArtifact(canvas, mode) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const recipes = ['cloud', 'ribbons', 'topology'];
  const recipe = recipes[Math.floor(Math.random() * recipes.length)];
  
  const params = {
    recipe,
    mode,
    points: [],
    seed: Math.random() * 1000,
    time: 0,
    frame: 0,
    w: canvas.width,
    h: canvas.height
  };

  const setupPoints = () => {
    params.points = [];
    const w = params.w, h = params.h;
    if (recipe === 'cloud') {
      const count = mode === 'logo' ? 45 : 80;
      for (let i = 0; i < count; i++) {
        params.points.push({
          x: Math.random() * w, y: Math.random() * h,
          ox: Math.random() * w, oy: Math.random() * h,
          size: Math.random() * 1.8 * dpr + 0.6,
          speed: Math.random() * 0.05 + 0.02
        });
      }
    } else if (recipe === 'ribbons') {
      const count = mode === 'logo' ? 4 : 6;
      for (let i = 0; i < count; i++) {
        params.points.push({
          phase: Math.random() * Math.PI * 2,
          freq: Math.random() * 0.4 + 0.3,
          amp: Math.random() * 0.35 * w + 0.1 * w
        });
      }
    } else if (recipe === 'topology') {
      const count = mode === 'logo' ? 10 : 14;
      for (let i = 0; i < count; i++) {
        params.points.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6
        });
      }
    }
  };

  setupPoints();

  const animate = (timestamp) => {
    if (!canvas.parentElement) return; 

    // FOOLPROOF WATCHDOG: Re-check dimensions if zero or during first 30 frames
    if (params.w === 0 || params.h === 0 || params.frame < 30) {
      const rect = canvas.getBoundingClientRect();
      const newW = rect.width * dpr;
      const newH = rect.height * dpr;
      if (newW !== params.w || newH !== params.h) {
         canvas.width = params.w = newW;
         canvas.height = params.h = newH;
         setupPoints();
      }
    }
    
    // GUARD: Never draw if still zero
    if (params.w === 0 || params.h === 0) {
       params.frame++;
       requestAnimationFrame(animate);
       return;
    }

    params.time += 0.01;
    params.frame++;
    ctx.clearRect(0, 0, params.w, params.h);
    
    const styles = getComputedStyle(document.documentElement);
    const accentColor = styles.getPropertyValue('--accent').trim() || '#0a6ebd';
    ctx.strokeStyle = accentColor;
    ctx.fillStyle = accentColor;
    ctx.lineWidth = mode === 'logo' ? 2.0 * dpr : 1.2 * dpr;

    const rect = canvas.getBoundingClientRect();
    const mx = (mousePos.x - rect.left) * dpr;
    const my = (mousePos.y - rect.top) * dpr;
    const isInside = mousePos.x >= rect.left && mousePos.x <= rect.right && 
                     mousePos.y >= rect.top && mousePos.y <= rect.bottom;

    if (params.recipe === 'cloud') {
      params.points.forEach(p => {
        const dx = Math.sin(params.time * p.speed + params.seed) * 12;
        const dy = Math.cos(params.time * p.speed * 0.9 + p.seed) * 12;
        let targetX = p.ox + dx, targetY = p.oy + dy;

        if (isInside) {
          const dist = Math.sqrt((mx - targetX)**2 + (my - targetY)**2);
          if (dist < 120 * dpr) {
            targetX += (mx - targetX) * 0.12;
            targetY += (my - targetY) * 0.12;
          }
        }
        p.x += (targetX - p.x) * 0.1; p.y += (targetY - p.y) * 0.1;
        ctx.globalAlpha = mode === 'logo' ? 1.0 : 0.7; // Logo is now pinned to 100% visibility
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

    } else if (params.recipe === 'ribbons') {
      ctx.globalAlpha = mode === 'logo' ? 1.0 : 0.45;
      params.points.forEach((r, idx) => {
        ctx.beginPath();
        for (let x = 0; x < params.w; x += 4) {
          const noise = Math.sin(x * 0.008 + params.time + r.phase) * r.amp;
          let distort = 0;
          if (isInside) {
             const distToMouse = Math.abs(x - mx);
             if (distToMouse < 70 * dpr) distort = (my - (params.h/2 + noise)) * 0.35;
          }
          const y = params.h/2 + noise + distort;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

    } else if (params.recipe === 'topology') {
      params.points.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > params.w) p.vx *= -1;
        if (p.y < 0 || p.y > params.h) p.vy *= -1;
        if (isInside) { p.x += (mx - p.x) * 0.025; p.y += (my - p.y) * 0.025; }
        ctx.globalAlpha = mode === 'logo' ? 1.0 : 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = 0; i < params.points.length; i++) {
        for (let j = i + 1; j < params.points.length; j++) {
          const dist = Math.sqrt((params.points[i].x-params.points[j].x)**2 + (params.points[i].y-params.points[j].y)**2);
          if (dist < params.w * 0.45) {
            ctx.globalAlpha = (1 - dist / (params.w * 0.45)) * 0.35;
            ctx.beginPath();
            ctx.moveTo(params.points[i].x, params.points[i].y);
            ctx.lineTo(params.points[j].x, params.points[j].y);
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
