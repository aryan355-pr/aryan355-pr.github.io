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

// ====== CV Download / Print ======
const downloadCv = document.getElementById('downloadCv');
if (downloadCv) {
  downloadCv.addEventListener('click', (e) => {
    e.preventDefault();
    window.print();
  });
}

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
      vx: (Math.random() - 0.5) * 0.4,  // slow movement
      vy: (Math.random() - 0.5) * 0.4
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
