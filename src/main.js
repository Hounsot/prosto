import './style.css'
import { initFallingWords } from "./js/fallingWords.js";
import { initBurgerMenu } from "./js/burgerMenu.js";
import './js/tildaBridge.js';

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
  const scaleRoot = document.getElementById('scaleRoot');
  if (!scaleRoot) return; // nothing to scale

  const scale = computeScale();

  const supportsZoom = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('zoom', '1');

  // Clear any scaling on small screens
  if (scale === 1) {
    scaleRoot.style.zoom = '';
    scaleRoot.style.transform = '';
    scaleRoot.style.transformOrigin = '';
    scaleRoot.style.width = '';
    return;
  }

  if (supportsZoom) {
    scaleRoot.style.transform = '';
    scaleRoot.style.transformOrigin = '';
    scaleRoot.style.width = '';
    scaleRoot.style.zoom = String(scale);
  } else {
    scaleRoot.style.zoom = '';
    scaleRoot.style.transformOrigin = 'top left';
    scaleRoot.style.transform = `scale(${scale})`;
    scaleRoot.style.width = `${BASE_WIDTH}px`;
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

// --- Projects carousel ---
function initProjectsCarousel() {
  const viewport = document.getElementById('projectsViewport');
  const track = document.getElementById('projectsTrack');
  const left = document.getElementById('projectsLeft');
  const right = document.getElementById('projectsRight');
  if (!viewport || !track || !left || !right) return;
  // Disable carousel behavior on mobile – keep original stacked layout
  if (window.innerWidth <= MOBILE_BREAKPOINT) return;

  const getItems = () => Array.from(track.querySelectorAll('.project'));

  function getStepWidth() {
    const items = getItems();
    if (items.length === 0) return viewport.clientWidth;
    const first = items[0];
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
      scrollToIndex(0);
    } else {
      scrollToIndex(next);
    }
  }

  function handleLeft() {
    const maxStart = getMaxStartIndex();
    const prev = getCurrentIndex() - 1;
    if (prev < 0) {
      scrollToIndex(maxStart);
    } else {
      scrollToIndex(prev);
    }
  }

  left.addEventListener('click', handleLeft);
  right.addEventListener('click', handleRight);

  // Touch swipe native; snap to nearest after scroll ends
  let scrollEndTimeout = 0;
  function scheduleSnapAlign() {
    if (scrollEndTimeout) window.clearTimeout(scrollEndTimeout);
    scrollEndTimeout = window.setTimeout(() => {
      const idx = getCurrentIndex();
      scrollToIndex(idx);
    }, 80);
  }
  viewport.addEventListener('scroll', scheduleSnapAlign, { passive: true });

  function realignOnResize() {
    scrollToIndex(getCurrentIndex());
  }
  window.addEventListener('resize', realignOnResize, { passive: true });
  window.addEventListener('orientationchange', realignOnResize, { passive: true });
}
window.addEventListener('DOMContentLoaded', initProjectsCarousel);


// Инициализация падающих слов после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  let modal = document.getElementById('modal');
  let modalForm = document.getElementById('modalForm');
  let modalOpen = document.querySelectorAll('#modalOpen');
  let modalClose = document.getElementById('modalClose');
  let modalBackground = document.getElementById('modalBackground');
  let services = document.querySelectorAll('.service');
  
  modalOpen.forEach(modalOpen => {
    modalOpen.addEventListener('click', (e) => {
    console.log('click');
    e.preventDefault();
    modal.classList.remove('pointer-events-none');
    modalForm.classList.remove('-translate-x-[-100%]');
    modalBackground.classList.remove('opacity-0');
    modalBackground.classList.add('opacity-50');
  });
  });

  modalClose.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('pointer-events-none');
    modalForm.classList.add('-translate-x-[-100%]');
    modalBackground.classList.add('opacity-0');
    modalBackground.classList.remove('opacity-50');
  });
  // Mobile tap hover emulation
  function enableMobileServiceActive() {
    if (window.innerWidth > MOBILE_BREAKPOINT) return;
    services.forEach((service) => {
      // Toggle active on tap; remove from siblings
      service.addEventListener('touchstart', (e) => {
        // Allow native scrolling; only toggle when tapping inside card
        services.forEach((s) => s.classList.remove('is-active'));
        service.classList.add('is-active');
      }, { passive: true });
    });
    // Clear active when tapping outside
    document.addEventListener('touchstart', (e) => {
      if (!(e.target instanceof Element)) return;
      const isService = e.target.closest('.service');
      if (!isService) {
        services.forEach((s) => s.classList.remove('is-active'));
      }
    }, { passive: true });
  }
  enableMobileServiceActive();
  modalBackground.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('pointer-events-none');
    modalForm.classList.add('-translate-x-[-100%]');
    modalBackground.classList.add('opacity-0');
    modalBackground.classList.remove('opacity-50');
  });
  
  let fallingWordsInstance = initFallingWords();
  initBurgerMenu();

  // Debounce функция для перезапуска анимации при resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    // Skip resize handling on mobile to avoid restarting animation when browser UI changes
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Очищаем старый инстанс
      if (fallingWordsInstance && fallingWordsInstance.cleanup) {
        fallingWordsInstance.cleanup();
      }
      // Создаем новый
      fallingWordsInstance = initFallingWords();
    }, 300); // Ждем 300мс после окончания resize
  });
});
