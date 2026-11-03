export function startCanvasAnimation() {
  const canvas = document.getElementById('ps2Canvas');
  const ctx = canvas.getContext('2d');
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  const trailCanvas = document.createElement('canvas');
  const trailCtx = trailCanvas.getContext('2d');

  let cssSize = 0;
  let dpr = 1;

  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  let circleColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--circle-bg').trim();
  colorScheme.addEventListener('change', () => {
    circleColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--circle-bg').trim();
  });

  const circleRadius = 100;

  function updateCanvasSize() {
    const innerHeight = window.innerHeight;
    const viewportHeight = window.visualViewport?.height || innerHeight;
    const isZoomed = viewportHeight < innerHeight * 0.95;

    const headerHeight = header?.offsetHeight ?? 0;
    const footerHeight = footer.offsetHeight;
    const padding = isZoomed
      ? 80
      : Math.max(120, viewportHeight * 0.15);

    const available = viewportHeight - (headerHeight + footerHeight + padding);
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const size = Math.min(Math.max(viewportWidth * 0.4, circleRadius * 2 + 20), available);

    if (size < circleRadius * 2) {
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = 'block';
    dpr = window.devicePixelRatio || 1;
    cssSize = size;
    const bufferSize = Math.round(size * dpr);
    canvas.width = canvas.height = bufferSize;
    trailCanvas.width = trailCanvas.height = bufferSize;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }

  window.addEventListener('resize', updateCanvasSize);
  window.visualViewport?.addEventListener('resize', updateCanvasSize);
  updateCanvasSize();

  const dx = 50;
  const dy = 50;
  const r = 6;
  const numDots = 7;
  const dotMultipliers = [1, 2, 3, 4, 5, 6, 7];
  const trailSamples = 42;
  const trailAngleStep = 0.006 * 2 * Math.PI;
  const trailHeadWidth = 2.5;
  const fps = 60;
  const frameInterval = 1000 / fps;
  let lastFrameTime = 0;

  function animate(currentTime) {
    requestAnimationFrame(animate);

    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) return;
    lastFrameTime = currentTime;

    if (canvas.style.display === 'none') return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);
    trailCtx.clearRect(0, 0, cssSize, cssSize);

    const now = new Date();
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const baseAngle = (seconds / 60) * 2 * Math.PI;
    const sinCosDiff = Math.sin(seconds * 2 * Math.PI / 30) * 4;
    const xc = cssSize / 2;
    const yc = cssSize / 2;

    ctx.beginPath();
    ctx.arc(xc, yc, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = circleColor;
    ctx.fill();

    trailCtx.lineCap = 'round';
    trailCtx.lineJoin = 'round';
    for (let i = 0; i < numDots; i++) {
      const multiplier = dotMultipliers[i];
      let prevX = Math.cos(baseAngle * multiplier) * dx + xc;
      let prevY = Math.sin(baseAngle * multiplier + sinCosDiff) * dy + yc;

      for (let t = 1; t < trailSamples; t++) {
        const fade = 1 - t / trailSamples;
        const trailAngle = baseAngle * multiplier - t * trailAngleStep;
        const x = Math.cos(trailAngle) * dx + xc;
        const y = Math.sin(trailAngle + sinCosDiff) * dy + yc;

        trailCtx.beginPath();
        trailCtx.moveTo(prevX, prevY);
        trailCtx.lineTo(x, y);
        trailCtx.lineWidth = trailHeadWidth * fade;
        trailCtx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.8})`;
        trailCtx.stroke();

        prevX = x;
        prevY = y;
      }
    }

    ctx.save();
    ctx.filter = 'blur(4px)';
    ctx.drawImage(trailCanvas, 0, 0, cssSize, cssSize);
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

  requestAnimationFrame(animate);
}
