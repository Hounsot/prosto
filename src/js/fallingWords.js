import Matter from "matter-js";

export function initFallingWords() {
  const container = document.getElementById("fallingText");
  if (!container) return;

  const THICCNESS = 60;
  const MOBILE_BREAKPOINT = 768;

  // Создаем движок Matter.js
  const Engine = Matter.Engine;
  const Render = Matter.Render;
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  const Composite = Matter.Composite;
  const Mouse = Matter.Mouse;
  const MouseConstraint = Matter.MouseConstraint;
  const Runner = Matter.Runner;

  const engine = Engine.create();
  engine.gravity.y = 1; // Гравитация

  // Создаем рендер
  const render = Render.create({
    element: container,
    engine: engine,
    options: {
      width: container.clientWidth,
      height: container.clientHeight,
      wireframes: false,
      background: "transparent",
      showAngleIndicator: false,
      pixelRatio: window.devicePixelRatio || 1,
    },
  });

  // Создаем стены (границы контейнера)
  const wallOptions = {
    isStatic: true,
    render: {
      fillStyle: "transparent",
      strokeStyle: "transparent",
      lineWidth: 0,
    },
  };

  const ground = Bodies.rectangle(
    container.clientWidth / 2,
    container.clientHeight + THICCNESS / 2,
    27184,
    THICCNESS,
    wallOptions
  );

  const leftWall = Bodies.rectangle(
    0 - THICCNESS / 2,
    container.clientHeight / 2,
    THICCNESS,
    container.clientHeight * 5,
    wallOptions
  );

  const rightWall = Bodies.rectangle(
    container.clientWidth + THICCNESS / 2,
    container.clientHeight / 2,
    THICCNESS,
    container.clientHeight * 5,
    wallOptions
  );

  const topWall = Bodies.rectangle(
    container.clientWidth / 2,
    0 - THICCNESS / 2,
    container.clientWidth,
    THICCNESS,
    wallOptions
  );

  // Функция для получения высоты черного блока в зависимости от ширины экрана
  function getBlackBlockHeight() {
    if (container.clientWidth < 350) {
      return container.clientWidth * 1.3;
    } else if (container.clientWidth < 381) {
      return container.clientWidth * 1.30;
    } else if (container.clientWidth < 400) {
      return container.clientWidth * 1.22;
    } else if (container.clientWidth < 470) {
      return container.clientWidth * 1.16;
    } else if (container.clientWidth < 500) {
      return container.clientWidth * 1.05;
    } else if (container.clientWidth < 550) {
      return container.clientWidth * 0.95;
    } else if (container.clientWidth < 600) {
      return container.clientWidth * 0.88;
    } else if (container.clientWidth < 650) {
      return container.clientWidth * 0.85;
    } else if (container.clientWidth < 690) {
      return container.clientWidth * 0.79;
    } else if (container.clientWidth < 710) {
      return container.clientWidth * 0.75;
    } else if (container.clientWidth < 750) {
      return container.clientWidth * 0.71;
    } else if (container.clientWidth < 820) {
      return container.clientWidth * 0.69;
    } else if (container.clientWidth < 855) {
      return container.clientWidth * 0.67;
    } else if (container.clientWidth < 900) {
      return container.clientWidth * 0.65;
    } else if (container.clientWidth < 920) {
      return container.clientWidth * 0.62;
    } else if (container.clientWidth < 960) {
      return container.clientWidth * 0.62;
    } else {
      // Десктоп (>= 960px): фиксированная высота
      return 530;
    }
  }

  // Функция для получения ширины черного блока в зависимости от ширины экрана
  function getBlackBlockWidth() {
    // На маленьких экранах: 750px = 100vw (во весь экран)
    return container.clientWidth < 960 ? container.clientWidth : 750;
  }

  // Чёрный блок в левом нижнем углу
  const blackBlockHeight = getBlackBlockHeight();
  const blackBlockWidth = getBlackBlockWidth();
  const blackBlock = Bodies.rectangle(
    blackBlockWidth / 2, // x = половина ширины блока
    container.clientHeight - blackBlockHeight / 2, // y = высота контейнера - половина высоты блока
    blackBlockWidth,
    blackBlockHeight,
    {
      isStatic: true,
      render: {
        fillStyle: "#000000",
        strokeStyle: "transparent",
        lineWidth: 0,
      },
    }
  );

  // Добавляем стены и блок в мир
  Composite.add(engine.world, [
    ground,
    leftWall,
    rightWall,
    topWall,
    blackBlock,
  ]);

  // Слова для анимации
  const words = [
    "позиционирование",
    "консалтинг",
    "нейминг",
    "бренд-архитектура",
    "дизайн",
    "брендинг",
    "креатив",
    "стратегия",
    "спецпроекты",
    "мерч",
    "бренд-платформа",
    "360",
  ];

  // Функция для получения размера шрифта в зависимости от ширины экрана
  function getFontSize() {
    return container.clientWidth < 960 ? 34 : 90;
  }

  // Функция для измерения размеров текста
  function measureText(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const fontSize = getFontSize();
    // Используем NumbersProsto для слова "360", иначе MarkTheMoment
    const fontFamily = text === "360" ? "NumbersProsto" : "MarkTheMoment";
    ctx.font = `500 ${fontSize}px ${fontFamily}, sans-serif`;
    const metrics = ctx.measureText(text);
    const width = metrics.width + 40; // padding
    const height = fontSize < 50 ? 20 : 44; // font size + padding
    return { width, height };
  }

  // Создаем тела для всех слов с рандомными позициями
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const { width, height } = measureText(word);

    // Рандомная позиция и угол как в референсе
    // На экранах < 960px спавн сверху по центру, на больших - в правой половине
    const x =
      container.clientWidth < 960
        ? container.clientWidth * 0.25 +
          Math.random() * (container.clientWidth * 0.5)
        : container.clientWidth / 2 +
          Math.random() * (container.clientWidth / 2);
    const y =
      container.clientWidth < 960
        ? Math.random() * container.clientHeight * 0.3 + Math.random() * 40
        : Math.random() * container.clientHeight * 0.7 + Math.random() * 40;
    const angle = (Math.random() - 0.5) * (Math.PI / 3);

    const wordBody = Bodies.rectangle(x, y, width, height, {
      angle: angle,
      friction: 0.3,
      frictionAir: 0.00001,
      restitution: 0.8,
      render: {
        fillStyle: "transparent",
        strokeStyle: "transparent",
        lineWidth: 0,
      },
      label: word,
    });

    Composite.add(engine.world, wordBody);
  }

  // Настраиваем мышь для драга
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  });

  Composite.add(engine.world, mouseConstraint);

  // Разрешаем скролл через canvas
  mouseConstraint.mouse.element.removeEventListener(
    "wheel",
    mouseConstraint.mouse.mousewheel
  );
  mouseConstraint.mouse.element.removeEventListener(
    "DOMMouseScroll",
    mouseConstraint.mouse.mousewheel
  );

  // Кастомный рендеринг текста на canvas
  Matter.Events.on(render, "afterRender", () => {
    const ctx = render.context;
    const fontSize = getFontSize();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    engine.world.bodies.forEach((body) => {
      // Рисуем только наши слова из массива words
      if (body.label && words.includes(body.label)) {
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        // Устанавливаем правильный шрифт для каждого слова
        const fontFamily =
          body.label === "360" ? "NumbersProsto" : "MarkTheMoment";
        ctx.font = `500 ${fontSize}px ${fontFamily}, sans-serif`;

        // Рисуем фон с закругленными углами
        const metrics = ctx.measureText(body.label);
        const textWidth = metrics.width;
        const padding = 20;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = fontSize < 50 ? 20 : 44;

        ctx.fillStyle = "rgba(0, 0, 0, 0)";

        // Рисуем rounded rectangle
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(-bgWidth / 2 + radius, -bgHeight / 2);
        ctx.lineTo(bgWidth / 2 - radius, -bgHeight / 2);
        ctx.quadraticCurveTo(
          bgWidth / 2,
          -bgHeight / 2,
          bgWidth / 2,
          -bgHeight / 2 + radius
        );
        ctx.lineTo(bgWidth / 2, bgHeight / 2 - radius);
        ctx.quadraticCurveTo(
          bgWidth / 2,
          bgHeight / 2,
          bgWidth / 2 - radius,
          bgHeight / 2
        );
        ctx.lineTo(-bgWidth / 2 + radius, bgHeight / 2);
        ctx.quadraticCurveTo(
          -bgWidth / 2,
          bgHeight / 2,
          -bgWidth / 2,
          bgHeight / 2 - radius
        );
        ctx.lineTo(-bgWidth / 2, -bgHeight / 2 + radius);
        ctx.quadraticCurveTo(
          -bgWidth / 2,
          -bgHeight / 2,
          -bgWidth / 2 + radius,
          -bgHeight / 2
        );
        ctx.closePath();
        ctx.fill();

        // Рисуем текст (uppercase)
        ctx.fillStyle = "#FEC7FF";
        ctx.fillText(body.label.toUpperCase(), 0, 0);

        ctx.restore();
      }
    });
  });

  // Запускаем рендер
  Render.run(render);

  // Создаем и запускаем runner
  const runner = Runner.create();
  Runner.run(runner, engine);

  // Функция обработки resize
  function handleResize() {
    // Ignore resize adjustments on mobile to prevent redraws on address/tab bar changes
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    render.canvas.width = container.clientWidth;
    render.canvas.height = container.clientHeight;

    // Обновляем позиции стен
    Matter.Body.setPosition(
      ground,
      Matter.Vector.create(
        container.clientWidth / 2,
        container.clientHeight + THICCNESS / 2
      )
    );

    Matter.Body.setPosition(
      rightWall,
      Matter.Vector.create(
        container.clientWidth + THICCNESS / 2,
        container.clientHeight / 2
      )
    );

    Matter.Body.setPosition(
      topWall,
      Matter.Vector.create(container.clientWidth / 2, 0 - THICCNESS / 2)
    );

    // Обновляем размер и позицию чёрного блока
    const newBlackBlockHeight = getBlackBlockHeight();
    const newBlackBlockWidth = getBlackBlockWidth();

    // Удаляем старый блок и создаем новый с правильными размерами
    World.remove(engine.world, blackBlock);
    const newBlackBlock = Bodies.rectangle(
      newBlackBlockWidth / 2,
      container.clientHeight - newBlackBlockHeight / 2,
      newBlackBlockWidth,
      newBlackBlockHeight,
      {
        isStatic: true,
        render: {
          fillStyle: "#000000",
          strokeStyle: "transparent",
          lineWidth: 0,
        },
      }
    );
    World.add(engine.world, newBlackBlock);

    // Обновляем ссылку на blackBlock
    Object.assign(blackBlock, newBlackBlock);
  }

  // Функция очистки
  const cleanup = () => {
    window.removeEventListener("resize", handleResize);
    Render.stop(render);
    Runner.stop(runner);
    World.clear(engine.world);
    Engine.clear(engine);
    if (render.canvas && render.canvas.parentNode) {
      render.canvas.remove();
    }
  };

  window.addEventListener("resize", handleResize);

  return {
    engine,
    render,
    runner,
    cleanup,
  };
}