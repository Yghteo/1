// Задание 2. Библиотека: Publisher, Book, Magazine, Reception, Reader, Library

// ---------- Интерфейс Reception (Выдача) ----------
// В JavaScript нет интерфейсов, поэтому интерфейс описан как список
// обязательных методов и функция, которая проверяет, что класс их реализует.
const Reception = {
  name: 'Reception',
  methods: ['delivery', 'receive'],

  implementedBy(cls) {
    const missing = this.methods.filter(
      (m) => typeof cls.prototype[m] !== 'function'
    );
    if (missing.length) {
      throw new Error(
        `Класс ${cls.name} не реализует интерфейс ${this.name}: нет методов ${missing.join(', ')}`
      );
    }
    return true;
  },
};

// ---------- Абстрактный класс Publisher (Издание) ----------
class Publisher {
  #title;
  #author;
  #pubYear;
  #copies;

  constructor(title, author, pubYear, copies) {
    if (new.target === Publisher) {
      throw new Error('Нельзя создать экземпляр абстрактного класса Publisher');
    }
    this.#title = title;
    this.#author = author;
    this.#pubYear = pubYear;
    this.#copies = copies;
  }

  getTitle() { return this.#title; }
  setTitle(value) { this.#title = value; }

  getAuthor() { return this.#author; }
  setAuthor(value) { this.#author = value; }

  getPubYear() { return this.#pubYear; }
  setPubYear(value) { this.#pubYear = value; }

  getCopies() { return this.#copies; }
  setCopies(value) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('Количество экземпляров должно быть целым числом >= 0');
    }
    this.#copies = value;
  }

  // Общая логика выдачи и приёма для всех изданий
  delivery(reader) {
    if (this.#copies === 0) {
      console.log(`Выдача невозможна: экземпляров «${this.#title}» не осталось`);
      return false;
    }
    if (!reader.canTake()) {
      console.log(
        `Выдача невозможна: у читателя ${reader.getFullName()} уже ${Reader.MAX_ITEMS} изданий (максимум)`
      );
      return false;
    }
    if (reader.hasItem(this)) {
      console.log(`Выдача невозможна: «${this.#title}» уже есть у читателя ${reader.getFullName()}`);
      return false;
    }
    this.#copies--;
    reader.addItem(this);
    console.log(`Выдано: «${this.#title}» -> ${reader.getFullName()}. Осталось экземпляров: ${this.#copies}`);
    return true;
  }

  receive(reader) {
    if (!reader.hasItem(this)) {
      console.log(`Возврат невозможен: у читателя ${reader.getFullName()} нет «${this.#title}»`);
      return false;
    }
    reader.removeItem(this);
    this.#copies++;
    console.log(`Принято: «${this.#title}» от ${reader.getFullName()}. Осталось экземпляров: ${this.#copies}`);
    return true;
  }

  // Абстрактный метод: каждый наследник обязан его переопределить
  getInfo() {
    throw new Error('Метод getInfo() должен быть реализован в подклассе');
  }

  showInfo() {
    console.log(this.getInfo());
  }
}

// ---------- Book (Книга) ----------
class Book extends Publisher {
  #pages;

  constructor(title, author, pubYear, copies, pages) {
    super(title, author, pubYear, copies);
    this.#pages = pages;
  }

  getPages() { return this.#pages; }
  setPages(value) { this.#pages = value; }

  delivery(reader) { return super.delivery(reader); }
  receive(reader) { return super.receive(reader); }

  getInfo() {
    return `Книга: «${this.getTitle()}», автор: ${this.getAuthor()}, год: ${this.getPubYear()}, ` +
      `страниц: ${this.#pages}, экземпляров: ${this.getCopies()}`;
  }
}

// ---------- Magazine (Журнал) ----------
class Magazine extends Publisher {
  #issue;

  constructor(title, author, pubYear, copies, issue) {
    super(title, author, pubYear, copies);
    this.#issue = issue;
  }

  getIssue() { return this.#issue; }
  setIssue(value) { this.#issue = value; }

  delivery(reader) { return super.delivery(reader); }
  receive(reader) { return super.receive(reader); }

  getInfo() {
    return `Журнал: «${this.getTitle()}» №${this.#issue}, редакция: ${this.getAuthor()}, год: ${this.getPubYear()}, ` +
      `экземпляров: ${this.getCopies()}`;
  }
}

// Проверяем, что Book и Magazine реализуют интерфейс Reception
Reception.implementedBy(Book);
Reception.implementedBy(Magazine);

// ---------- Reader (Читатель) ----------
class Reader {
  static MAX_ITEMS = 3;

  #firstName;
  #lastName;
  #items;

  constructor(firstName, lastName, items = []) {
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#items = [...items];
  }

  getFirstName() { return this.#firstName; }
  setFirstName(value) { this.#firstName = value; }

  getLastName() { return this.#lastName; }
  setLastName(value) { this.#lastName = value; }

  getItems() { return [...this.#items]; } // копия, чтобы список не меняли снаружи
  setItems(items) {
    if (items.length > Reader.MAX_ITEMS) {
      throw new Error(`У читателя не может быть больше ${Reader.MAX_ITEMS} изданий`);
    }
    this.#items = [...items];
  }

  getFullName() { return `${this.#firstName} ${this.#lastName}`; }

  canTake() { return this.#items.length < Reader.MAX_ITEMS; }
  hasItem(item) { return this.#items.includes(item); }
  addItem(item) { this.#items.push(item); }
  removeItem(item) { this.#items = this.#items.filter((i) => i !== item); }

  // Выдача и возврат со стороны читателя
  take(item) { return item.delivery(this); }
  giveBack(item) { return item.receive(this); }

  showInfo() {
    const list = this.#items.length
      ? this.#items.map((i) => `«${i.getTitle()}»`).join(', ')
      : 'нет изданий';
    console.log(`Читатель: ${this.getFullName()} (${this.#items.length}/${Reader.MAX_ITEMS}): ${list}`);
  }
}

// ---------- Library (Библиотека) ----------
class Library {
  #items = [];

  addItem(item) {
    if (!(item instanceof Publisher)) {
      console.log('Ошибка: в библиотеку можно добавить только издание');
      return false;
    }
    if (this.#items.includes(item)) {
      console.log(`«${item.getTitle()}» уже есть в библиотеке`);
      return false;
    }
    this.#items.push(item);
    console.log(`Добавлено в библиотеку: «${item.getTitle()}»`);
    return true;
  }

  removeItem(item) {
    const index = this.#items.indexOf(item);
    if (index === -1) {
      console.log(`«${item.getTitle()}» нет в библиотеке`);
      return false;
    }
    this.#items.splice(index, 1);
    console.log(`Удалено из библиотеки: «${item.getTitle()}»`);
    return true;
  }

  getItems() { return [...this.#items]; }

  showInfo() {
    console.log(`В библиотеке изданий: ${this.#items.length}`);
    this.#items.forEach((item, i) => console.log(`  ${i + 1}. ${item.getInfo()}`));
  }
}

// ================= Тестирование =================

console.log('--- Абстрактный класс ---');
try {
  new Publisher('Нечто', 'Некто', 2000, 1);
} catch (e) {
  console.log(e.message);
}

console.log('\n--- Создание изданий и библиотеки ---');
const book1 = new Book('Мастер и Маргарита', 'М. Булгаков', 1967, 3, 480);
const book2 = new Book('Преступление и наказание', 'Ф. Достоевский', 1866, 1, 672);
const book3 = new Book('Война и мир', 'Л. Толстой', 1869, 3, 1300);
const mag1 = new Magazine('Наука и жизнь', 'Редакция «Наука и жизнь»', 2026, 2, 9);
const mag2 = new Magazine('Вокруг света', 'Редакция «Вокруг света»', 2026, 1, 10);

const library = new Library();
[book1, book2, book3, mag1, mag2].forEach((item) => library.addItem(item));
library.addItem(book1);          // повторное добавление
library.addItem('просто строка'); // не издание
library.showInfo();

console.log('\n--- Геттеры и сеттеры ---');
console.log(book1.getTitle(), '|', book1.getAuthor(), '|', book1.getPubYear(), '|', book1.getPages());
mag1.setIssue(11);
book3.setPubYear(1873);
console.log(mag1.getInfo());
console.log(book3.getInfo());

console.log('\n--- Читатели ---');
const reader1 = new Reader('Иван', 'Петров');
const reader2 = new Reader('Анна', 'Смирнова');
reader2.setLastName('Кузнецова');
reader1.showInfo();
reader2.showInfo();

console.log('\n--- Выдача изданий ---');
reader1.take(book1);
reader1.take(book2);
reader1.take(mag1);
reader1.take(book3);   // у читателя уже максимум изданий
reader2.take(book2);   // экземпляров не осталось
reader2.take(book1);
reader2.take(book1);   // эта книга у читателя уже есть
reader1.showInfo();
reader2.showInfo();

console.log('\n--- Возврат изданий ---');
reader1.giveBack(book2);
reader2.take(book2);   // теперь экземпляр есть
reader2.giveBack(mag2); // этого издания у читателя нет
reader1.showInfo();
reader2.showInfo();

console.log('\n--- Удаление из библиотеки ---');
library.removeItem(mag2);
library.removeItem(mag2); // повторное удаление
library.showInfo();
