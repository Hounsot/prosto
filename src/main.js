import './style.css'

const BASE_WIDTH = 1920;
const MOBILE_BREAKPOINT = 768; // do not scale on small screens

function computeScale() {
  const width = window.innerWidth;
  if (width <= MOBILE_BREAKPOINT) return 1;
  const rawScale = width / BASE_WIDTH;
  // clamp between 0 and 1 (downscale only)
  return Math.min(rawScale, 1);
}

function applyScale() {
  const scale = computeScale();

  const supportsZoom = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('zoom', '1');

  // Clear any scaling on small screens
  if (scale === 1) {
    document.body.style.zoom = '';
    document.body.style.transform = '';
    document.body.style.transformOrigin = '';
    document.body.style.width = '';
    return;
  }

  if (supportsZoom) {
    document.body.style.transform = '';
    document.body.style.transformOrigin = '';
    document.body.style.width = '';
    document.body.style.zoom = String(scale);
  } else {
    document.body.style.zoom = '';
    document.body.style.transformOrigin = 'top left';
    document.body.style.transform = `scale(${scale})`;
    document.body.style.width = `${BASE_WIDTH}px`;
  }
}

let resizeRafId = 0;
function onResize() {
  if (resizeRafId) cancelAnimationFrame(resizeRafId);
  resizeRafId = requestAnimationFrame(applyScale);
}

window.addEventListener('resize', onResize, { passive: true });
window.addEventListener('orientationchange', onResize, { passive: true });
window.addEventListener('DOMContentLoaded', applyScale);
applyScale();
