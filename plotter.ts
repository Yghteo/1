/**
 * Задание 3. Плоттер в объектно-ориентированном стиле.
 *
 * Плоттер поддерживает пять команд:
 * 1. Переместить каретку на некоторое расстояние в текущем направлении.
 * 2. Повернуть на определенное количество градусов по часовой стрелке или против часовой стрелки.
 * 3. Опустить или поднять каретку. Когда каретка опущена, плоттер при перемещении рисует линию.
 * 4. Установить цвет линии (один из черного, красного или зелёного).
 * 5. Установить начальную позицию каретки.
 */

/**
 * Объявление типов
 */
type Point = number;
type Distance = number;
type Angle = number;
type Position = { x: Point; y: Point };

enum CarriageState {
  UP,
  DOWN,
}

enum LineColor {
  BLACK = "чёрный",
  RED = "красный",
  GREEN = "зелёный",
}

// Цвет можно передать как значение enum или как строку: 'Black' | 'Red' | 'Green'
type ColorName = "Black" | "Red" | "Green";

/**
 * Интерфейс логгера (из условия задания)
 */
interface Logger {
  log(message: string): void;
}

/**
 * Логгер, который выводит сообщения в консоль
 */
class LogToConsole implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

/**
 * Основной класс плоттера.
 * Хранит своё состояние (позиция, угол, цвет, каретка) в приватных полях,
 * а все действия сообщает через переданный логгер.
 */
class Plotter {
  private static readonly colorsByName: Record<ColorName, LineColor> = {
    Black: LineColor.BLACK,
    Red: LineColor.RED,
    Green: LineColor.GREEN,
  };

  private readonly logger: Logger;
  private position: Position;
  private angle: Angle;
  private color: LineColor;
  private carriageState: CarriageState;

  /**
   * Логгер можно передать как готовый объект (new LogToConsole())
   * или как класс (LogToConsole) — тогда плоттер создаст его сам.
   */
  constructor(
    logger: Logger | (new () => Logger),
    position: Position = { x: 0, y: 0 },
    angle: Angle = 0,
    color: LineColor = LineColor.BLACK,
    carriageState: CarriageState = CarriageState.UP
  ) {
    this.logger = typeof logger === "function" ? new logger() : logger;
    this.position = { ...position };
    this.angle = angle;
    this.color = color;
    this.carriageState = carriageState;
  }

  /**
   * 1. Перемещает каретку на расстояние distance в текущем направлении.
   * Если каретка опущена — чертит линию.
   */
  move(distance: Distance): void {
    const newPosition = this.calcNewPosition(distance);

    if (this.carriageState === CarriageState.DOWN) {
      this.drawLine(this.position, newPosition);
    } else {
      this.logger.log(
        `Передвигаем на ${distance} от точки (${this.position.x}, ${this.position.y})`
      );
    }

    this.position = newPosition;
  }

  /**
   * 2. Поворачивает каретку на угол angle.
   * Положительный угол — против часовой стрелки, отрицательный — по часовой.
   */
  turn(angle: Angle): void {
    this.logger.log(`Поворачиваем на ${angle} градусов`);
    // нормализуем угол в диапазон [0, 360)
    this.angle = (((this.angle + angle) % 360) + 360) % 360;
  }

  /**
   * 3. Поднимает каретку
   */
  carriageUp(): void {
    this.logger.log("Поднимаем каретку");
    this.carriageState = CarriageState.UP;
  }

  /**
   * 3. Опускает каретку
   */
  carriageDown(): void {
    this.logger.log("Опускаем каретку");
    this.carriageState = CarriageState.DOWN;
  }

  /**
   * 4. Устанавливает цвет линии
   */
  setColor(color: LineColor | ColorName): void {
    const newColor =
      color in Plotter.colorsByName
        ? Plotter.colorsByName[color as ColorName]
        : (color as LineColor);

    if (!Object.values(LineColor).includes(newColor)) {
      this.logger.log(`Неизвестный цвет "${color}". Цвет не изменён.`);
      return;
    }

    this.logger.log(`Устанавливаем ${newColor} цвет линии.`);
    this.color = newColor;
  }

  /**
   * 5. Устанавливает позицию каретки
   */
  setPosition(position: Position): void {
    this.logger.log(`Устанавливаем позицию каретки в (${position.x}, ${position.y}).`);
    this.position = { ...position };
  }

  /**
   * Вычисляет новую позицию при перемещении на distance в текущем направлении
   */
  private calcNewPosition(distance: Distance): Position {
    // Преобразуем градусы в радианы: 180 градусов = pi радиан
    const angleInRads = this.angle * (Math.PI / 180.0);
    const x = this.position.x + distance * Math.cos(angleInRads);
    const y = this.position.y + distance * Math.sin(angleInRads);
    // Math.round(-0) даёт -0, "+ 0" превращает его в обычный 0
    return { x: Math.round(x) + 0, y: Math.round(y) + 0 };
  }

  /**
   * Чертит линию от координат from к координатам to
   */
  private drawLine(from: Position, to: Position): void {
    this.logger.log(
      `...Чертим линию из (${from.x}, ${from.y}) в (${to.x}, ${to.y}) используя ${this.color} цвет.`
    );
  }
}

/**
 * Функции для черчения фигур
 */

/**
 * Чертит треугольник со сторонами size (пример из условия)
 */
function drawTriangle(plt: Plotter, size: Distance): void {
  plt.setColor("Green");
  for (let i = 0; i < 3; ++i) {
    plt.carriageDown();
    plt.move(size);
    plt.carriageUp();
    plt.turn(120.0);
  }
}

/**
 * Чертит квадрат со сторонами size
 */
function drawSquare(plt: Plotter, size: Distance): void {
  plt.carriageDown();
  for (let i = 0; i < 4; ++i) {
    plt.move(size);
    plt.turn(90.0);
  }
  plt.carriageUp();
}

/**
 * Процесс черчения
 */
const plotter = new Plotter(LogToConsole);
drawTriangle(plotter, 100.0);

console.log("\n--- Дополнительно: квадрат из исходного кода ---");
plotter.setPosition({ x: 10.0, y: 10.0 });
plotter.setColor(LineColor.RED);
drawSquare(plotter, 80.0);

console.log("\n--- Перемещение с поднятой кареткой ---");
plotter.move(50);
