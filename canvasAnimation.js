export function startCanvasAnimation() {
  const canvas = document.getElementById('ps2Canvas');
  const ctx = canvas.getContext('2d');
  const wrapper = document.querySelector('.canvas-wrapper');
  const footer = document.querySelector('footer');
  const h1 = document.querySelector('h1');
  const p = document.querySelector('p');

  const trailCanvas = document.createElement('canvas');
  const trailCtx = trailCanvas.getContext('2d');

  function updateCanvasSize() {
    const canvasVisibleMinSize = 60;

    const innerHeight = window.innerHeight;
    const viewportHeight = window.visualViewport?.height || innerHeight;
    const isZoomed = viewportHeight < innerHeight * 0.95;

    const headerHeight = h1.offsetHeight + p.offsetHeight;
    const footerHeight = footer.offsetHeight;
    const padding = isZoomed
      ? 80 // lighter padding if zoomed
      : Math.max(120, viewportHeight * 0.15); // generous padding normally

    const available = viewportHeight - (headerHeight + footerHeight + padding);
    let size = Math.min(window.innerWidth * 0.4, available);

    if (!isZoomed && size < canvasVisibleMinSize) {
      canvas.style.display = 'none';
      return;
    }

    size = Math.max(canvasVisibleMinSize, size);
    canvas.style.display = 'block';
    canvas.width = canvas.height = size;
    trailCanvas.width = trailCanvas.height = size;
  }

  window.addEventListener('resize', updateCanvasSize);
  updateCanvasSize();

  const dx = 50;
  const dy = 50;
  const numDots = 7;
  const dotMultipliers = [1, 2, 3, 4, 5, 6, 7];
  const trailSteps = 4;
  const fps = 60;
  const frameInterval = 1000 / fps;
  let lastFrameTime = 0;

  function animate(currentTime) {
    requestAnimationFrame(animate);

    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) return;
    lastFrameTime = currentTime;

    if (canvas.style.display === 'none') return;

    updateCanvasSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    trailCtx.clearRect(0, 0, canvas.width, canvas.height);

    const now = new Date();
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const baseAngle = (seconds / 60) * 2 * Math.PI;
    const sinCosDiff = Math.sin(seconds * 2 * Math.PI / 30) * 4;
    const xc = canvas.width / 2;
    const yc = canvas.height / 2;
    const r = canvas.width * 0.03;

    for (let i = 0; i < numDots; i++) {
      const multiplier = dotMultipliers[i];
      for (let t = 0; t < trailSteps; t++) {
        const fade = 1 - t / trailSteps;
        const trailAngle = baseAngle * multiplier - t * 0.015 * 2 * Math.PI;
        const x = Math.cos(trailAngle) * dx + xc;
        const y = Math.sin(trailAngle + sinCosDiff) * dy + yc;

        trailCtx.beginPath();
        trailCtx.ellipse(x, y, 2.4, 5, 0, 0, Math.PI * 2);
        trailCtx.fillStyle = `rgba(255, 255, 255, ${fade * 0.8})`;
        trailCtx.fill();
      }
    }

    ctx.save();
    ctx.filter = 'blur(2px)';
    ctx.drawImage(trailCanvas, 0, 0);
    ctx.restore();

    for (let i = 0; i < numDots; i++) {
      const angle = baseAngle * dotMultipliers[i];
      const x1 = Math.cos(angle) * dx + xc;
      const y1 = Math.sin(angle + sinCosDiff) * dy + yc;

      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'white';
      ctx.beginPath();
      ctx.arc(x1, y1, r, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.restore();
    }
  }

  animate();
}
