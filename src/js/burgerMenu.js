export function initBurgerMenu() {
    const burger = document.querySelector(".burger");
    const desktopNav = document.querySelector(".desktopNav");
  
    if (!burger || !desktopNav) return;
  
    burger.addEventListener("click", () => {
      desktopNav.classList.toggle("open");
    });
  }