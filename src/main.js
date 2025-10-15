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

// --- Feed carousel ---
function initFeedCarousel() {
  const viewport = document.getElementById('feedViewport');
  const track = document.getElementById('feedTrack');
  const left = document.getElementById('feedLeft');
  const right = document.getElementById('feedRight');
  if (!viewport || !track || !left || !right) return;

  const getItems = () => Array.from(track.querySelectorAll('.news'));

  function getStepWidth() {
    const items = getItems();
    if (items.length === 0) return viewport.clientWidth;
    const first = items[0];
    // Each card width includes gap. Use offsetWidth plus computed gap between items.
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    return Math.round(first.offsetWidth + gap);
  }

  function getVisibleCount() {
    const step = getStepWidth();
    const count = Math.max(1, Math.floor(viewport.clientWidth / step));
    return count;
  }

  function getMaxStartIndex() {
    const itemsCount = getItems().length;
    const visible = getVisibleCount();
    return Math.max(itemsCount - visible, 0);
  }

  function getCurrentIndex() {
    const step = getStepWidth();
    return Math.round(viewport.scrollLeft / step);
  }

  function scrollToIndex(index) {
    const step = getStepWidth();
    const maxStart = getMaxStartIndex();
    const clamped = Math.min(Math.max(index, 0), maxStart);
    viewport.scrollTo({ left: clamped * step, behavior: 'smooth' });
  }

  function handleRight() {
    const maxStart = getMaxStartIndex();
    const next = getCurrentIndex() + 1;
    if (next > maxStart) {
      // loop to start
      scrollToIndex(0);
    } else {
      scrollToIndex(next);
    }
  }

  function handleLeft() {
    const maxStart = getMaxStartIndex();
    const prev = getCurrentIndex() - 1;
    if (prev < 0) {
      // loop to end
      scrollToIndex(maxStart);
    } else {
      scrollToIndex(prev);
    }
  }

  left.addEventListener('click', handleLeft);
  right.addEventListener('click', handleRight);

  // Touch swipe (native scrolling). After scroll end, snap to nearest index.
  let scrollEndTimeout = 0;
  function scheduleSnapAlign() {
    if (scrollEndTimeout) window.clearTimeout(scrollEndTimeout);
    scrollEndTimeout = window.setTimeout(() => {
      const idx = getCurrentIndex();
      scrollToIndex(idx);
    }, 80);
  }
  viewport.addEventListener('scroll', scheduleSnapAlign, { passive: true });

  // Re-align on resize (cards can change width)
  function realignOnResize() {
    scrollToIndex(getCurrentIndex());
  }
  window.addEventListener('resize', realignOnResize, { passive: true });
  window.addEventListener('orientationchange', realignOnResize, { passive: true });
}

window.addEventListener('DOMContentLoaded', initFeedCarousel);
