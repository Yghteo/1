// Задание 1. Классы User и SuperUser

class User {
  static count = 0;

  #name;
  #login;
  #password;
  #grade;

  constructor(name, login, password, grade) {
    this.#name = name;
    this.#login = login;
    this.#password = password;

    if (!Number.isInteger(grade) || grade <= 0) {
      throw new Error('grade должен быть целым положительным числом > 0');
    }
    this.#grade = grade;

    // Считаем только "обычных" пользователей, наследники ведут свой счётчик
    if (new.target === User) {
      User.count++;
    }
  }

  // name: чтение и изменение
  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = value;
  }

  // login: только чтение
  get login() {
    return this.#login;
  }
  set login(value) {
    console.log('Невозможно изменить логин!');
  }

  // password: только изменение
  get password() {
    return '********';
  }
  set password(value) {
    this.#password = value;
  }

  // grade: недоступен ни для чтения, ни для изменения
  get grade() {
    return 'Неизвестное свойство grade';
  }
  set grade(value) {
    console.log('Неизвестное свойство grade');
  }

  showInfo() {
    console.log(`Name: ${this.#name}, Login: ${this.#login}`);
  }

  // Сравнение по grade (доступ к приватному полю другого экземпляра User)
  eq(other) {
    return this.#grade === other.#grade;
  }
  lt(other) {
    return this.#grade < other.#grade;
  }
  gt(other) {
    return this.#grade > other.#grade;
  }
}

class SuperUser extends User {
  static count = 0;

  #role;

  constructor(name, login, password, role, grade) {
    super(name, login, password, grade);
    this.#role = role;
    SuperUser.count++;
  }

  // role: чтение и изменение
  get role() {
    return this.#role;
  }
  set role(value) {
    this.#role = value;
  }

  showInfo() {
    console.log(`Name: ${this.name}, Login: ${this.login}, Role: ${this.#role}`);
  }
}

// ---------------- Проверка ----------------

const user1 = new User('Paul McCartney', 'paul', '1234', 3);
const user2 = new User('George Harrison', 'george', '5678', 2);
const user3 = new User('Richard Starkey', 'ringo', '8523', 3);
const admin = new SuperUser('John Lennon', 'john', '0000', 'admin', 5);

user1.showInfo();
admin.showInfo();

let users = User.count;
let admins = SuperUser.count;

console.log(`Всего обычных пользователей: ${users}`);
console.log(`Всего супер-пользователей: ${admins}`);

console.log(user1.lt(user2));
console.log(admin.gt(user3));
console.log(user1.eq(user3));

user3.name = 'Ringo Starr';
user1.password = 'Pa$$w0rd';

console.log(user3.name);
console.log(user2.password);
console.log(user2.login);

user2.login = 'geo';

console.log(user3.grade);
admin.grade = 10;
