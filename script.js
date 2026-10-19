// ====== Seamless SPA Router ======
function updateNavSelection() {
  let pathSegments = window.location.pathname.split('/').filter(Boolean);
  let currentFile = pathSegments.pop() || "index.html";
  if (currentFile.endsWith(".html") === false && currentFile !== "index.html") {
    currentFile += ".html";
  }
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    let itemHref = item.getAttribute('href') || "";
    let itemSegments = itemHref.split('/').filter(Boolean);
    let itemFile = itemSegments.pop() || "index.html";
    if (itemFile === currentFile || (currentFile === "index.html" && (itemHref === "/" || itemHref === "" || itemFile === "index.html"))) {
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
       if (typeof setupCarousel === 'function') {
         setupCarousel();
       }
    }
    
    // Update Title and active nav state
    document.title = doc.title;
    updateNavSelection();

    // Re-render MathJax on newly loaded content
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }

    // Update Theme Toggle Button UI
    updateThemeToggleButton();

    // Scroll to top of new page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch(e) {
    // If testing locally on file:// where fetch is blocked by CORS, fallback to hard redirect
    console.warn("SPA Load Failed, executing hard navigation.", e);
    window.location.href = url;
  }
}

// ====== Theme Toggle + Persistence ======
const body = document.body;

function updateThemeToggleButton() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isDark = body.classList.contains('dark');
  btn.innerHTML = isDark 
    ? '<i class="fas fa-sun" style="margin-right: 6px; color: #ffc107;"></i> <span>Light Mode</span>' 
    : '<i class="fas fa-moon" style="margin-right: 6px;"></i> <span>Dark Mode</span>';
}

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark');
}
updateThemeToggleButton();

// Toggle theme on button click
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#themeToggle');
  if (!btn) return;
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  updateThemeToggleButton();
});

// ====== BibTeX Clipboard Copy ======
function copyBibtex(btn) {
  const pre = document.getElementById('bibtex-content');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');
    if (span) span.textContent = 'Copied!';
    if (icon) icon.className = 'fas fa-check';
    btn.style.color = '#22c55e';
    btn.style.borderColor = '#22c55e';
    setTimeout(() => {
      if (span) span.textContent = 'Copy';
      if (icon) icon.className = 'far fa-copy';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  }).catch(() => {
    // Fallback if clipboard API is blocked
    const textarea = document.createElement('textarea');
    textarea.value = pre.textContent.trim();
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    const span = btn.querySelector('span');
    if (span) span.textContent = 'Copied!';
    setTimeout(() => { if (span) span.textContent = 'Copy'; }, 2000);
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
let slideInterval;

function setupCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  let currentIdx = 0;

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

  function startTimer() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }

  function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
  }

  if (nextBtn) nextBtn.onclick = () => {
    nextSlide();
    resetTimer();
  };

  if (prevBtn) prevBtn.onclick = () => {
    prevSlide();
    resetTimer();
  };

  if (slides.length > 0) {
    startTimer();
  }
}

document.addEventListener("DOMContentLoaded", setupCarousel);

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
});
