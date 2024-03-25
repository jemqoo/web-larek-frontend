# Проектная работа "Веб-ларёк"

## Описание проекта

Проект "Веб-ларёк" - интернет-магазин с товарами для веб-разработчиков. В нём можно посмотреть каталог товаров, добавить их в корзину и оформить заказ.

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Документация

В документации описана структура проекта, созданную в соответствии с принципом построения архитектуры проекта, который называется MVP. MVP расшифровывается так:

- Model (Модель) - класс, который работает с данными, проводит вычисления и руководит всеми бизнес-процессами.
- View (Вид или представление) - классы, показывающие пользователю интерфейс и данные из модели на экране.
- Presenter (Представитель) - класс, который обеспечивает связь, является посредником между моделью и видом.

В проекте представлены классы, соответствующие всем типам MVP:

- За модель (M) отвечает класс AppData;
- Класс представления (V), от которого наследуют все другие классы представления - это класс Component;
- Посредником (P) между представлением и моделью можно считать класс EventEmitter.

Суть принципа MVP заключается в том, что все цепочки действий, происходящие в проекте, можно представить следующей последовательностью: V --> P --> M --> P --> V. То есть, цепочка начинается, когда происходит событие, привязанное к какому-то визуальному элементу на экране.

## Базовый код

### 1. Абстрактный класс Api для работы с сервером

#### Конструктор принимает такие аргументы:

```
1. baseUrl: string — базовый URL для Api.

2. options: RequestInit = {} — дополнительные опции запроса.
```

#### Класс имеет такие методы:

```
1. handleResponse — защищенный метод, который обрабатывает ответ от сервера. Проверяет статус ответа (если успешный, то преобразует ответ в JSON, если нет - возвращает ошибку или текст ошибки);

2. get — для выполнения GET-запроса. Добавляет к базовому URL указанный URI и выполняет GET-запрос с установленными опциями. Возвращает Promise с полученными данными после обработки ответа;

3. post — для выполнения POST-запроса. Аналогично методу GET, добавляет к базовому URL указанный URI и выполняет POST-запрос с переданными данными в формате JSON и указанным методом запроса. Возвращает Promise с полученными данными после обработки ответа.
```

### 2. Класс EventEmitter - брокер событий, является посредником между представлением и моделью ("P" в терминах MVP)

#### Класс имеет такие методы:

```
1. on — установить обработчик на событие;

2. off — cнять обработчик с события;

3. emit — инициировать событие с данными;

4. onAll — слушать все события;

5. offAll — сбросить все обработчики;

6. trigger — сделать коллбек триггер, генерирующий событие при вызове;
```

### 3. Класс Model - абстрактный базовый класс для всех моделей данных в проекте

#### Конструктор принимает такие аргументы:

```
1. data: Partial<T> — представляет частичные данные модели типа T;

2. events: IEvents — является объектом событий (IEvents) для уведомления об изменениях в модели.
```

#### Класс имеет один метод:

```
1. emitChanges — сообщает всем, что модель поменялась.
```

### 4. Класс Component - абстрактный класс, класс представления, от которого наследуют все другие классы представления

#### Конструктор принимает один аргумент:

```
1. container: HTMLElement — представляет корневой элемент (HTMLElement), в котором будет отображаться компонент, используется для размещения содержимого компонента внутри DOM.
```

#### Класс имеет такие методы:

```
1. toggleClass — переключить класс;
2. setText — установить текстовое содержимое;
3. setDisabled — сменить статус блокировки;
4. setHidden — скрыть элемент;
5. setVisible — показать элемент;
6. setImage — установить изображение с алтернативным текстом;
7. render — вернуть корневой DOM-элемент.
```

## Компоненты модели данных

### Класс AppState

Этот класс отвечает за модель ("M" в терминах MVP). В нём содержатся методы, в которых и происходит работа непосредственно с данными приложения: с данными приходящими с сервера или уходящими на сервер, изменяющими состав товаров в модальных окнах и в корзине, а также работа со значениями в полях форм оформления заказа.

#### Класс имеет такие методы:

```
1. "setBasket" - Добавляет данные товара в поле корзины;
2. "setCatalog" - Добавляет данные товара в поле каталога;
3. "removeProduct" - Удаляет товар из корзины;
4. "clearBasket" - Очищает корзину;
5. "getTotal" - Получает сумму заказа;
6. "setOrderField" - Устанавливает значение поля заказа на основе переданных параметров и проверяет его на валидность;
7. "validateOrder" - Проверяет наличие ошибок в заказе и устанавливает соответствующие сообщения об ошибках;
8. "setPreview" - Метод для передачи данных для показа одного товара в модальном окне.
```

## Компоненты представления

Класс представления/отображения ("V" в терминах MVP), от которого наследуют все другие классы представления - это класс Component. От него непосредственно наследуют "общие" классы Modal, Basket, Form, Success. Далее ещё есть классы представления, которые более приближены к конкретному проекту, и у них нет наследников, это классы: Page, Card, Order, LarekApi.

### 1. Класс Modal

Этот класс позволяет создавать и управлять модальными окнами на веб-странице, открывать и закрывать их, а также отображать различный контент внутри модального окна.

#### Конструктор класса:

```
constructor(container: HTMLElement, events: IEvents) - конструктор класса, который инициализирует модальное окно, получая контейнер, в котором будет располагаться модальное окно, и события, которые будут использоваться в модальном окне.
```

#### Класс имеет такие методы:

```
1. set content(value: HTMLElement) - метод для установки контента в модальное окно;
2. open() - метод для открытия модального окна;
3. close() - метод для закрытия модального окна;
4. render(data: IModalData): HTMLElement - метод подготавливает родительский элемент (content) с дочерними элементами, который нужно вставить в разметку.
```

### 2. Класс Basket

Этот класс позволяет отображать и управлять корзиной на веб-странице, отображать список товаров, общую сумму заказа и управлять кнопкой для совершения заказа в зависимости от выбранных товаров.

#### Конструктор класса:

```
constructor(container: HTMLElement, events: EventEmitter) - конструктор класса, который инициализирует компонент корзины, получая контейнер, в котором будет располагаться корзина, и объект событий events. Также в конструкторе инициализируется список, общая сумма и кнопка в корзине, и устанавливается обработчик события на кнопке для открытия модального окна заказа.
```

#### Класс имеет такие методы:

```
1. set items(items: HTMLElement[]) - метод для установки элементов товаров в корзину. ;
2. set selected(items: string[]) - метод для установки выбранных товаров в корзине;
3. set total(total: number) - метод для установки общей суммы заказа в корзине.
```

### 3. Класс Form

Этот класс позволяет создавать и управлять формами на веб-странице, обрабатывать ввод данных, валидировать форму и обновлять состояние формы и ее элементы в зависимости от введенных данных и ошибок валидации.

#### Конструктор класса:

```
constructor(container: HTMLFormElement, events: IEvents) - конструктор класса, который инициализирует компонент формы, получая контейнер формы и объект событий events. В конструкторе устанавливаются обработчики событий на изменение полей формы и отправку формы.
```

#### Класс имеет такие методы:

```
1. protected onInputChange(field: keyof T, value: string) - защищенный метод, который вызывается при изменении значения поля ввода формы. Он генерирует событие с информацией о поле и его значении;
2. set valid(value: boolean) - метод для установки состояния валидности формы;
3. set errors(value: string) - метод для установки текста ошибок валидации формы;
4. render(state: Partial<T> & IFormState) - метод для отображения состояния формы.
```

### 4. Класс Success

Этот класс позволяет создавать и управлять успешными сообщениями или состояниями на веб-странице, и предоставляет возможность закрыть сообщение путем клика на соответствующий элемент.

#### Конструктор класса:

```
constructor(container: HTMLElement, actions: ISuccessActions) - конструктор класса, который инициализирует компонент успешного сообщения, получая контейнер сообщения и объект действий (actions). В конструкторе устанавливается обработчик события клика на элемент закрытия сообщения.
```

### 5. Класс Page

Этот класс позволяет управлять различными элементами страницы, отображать информацию о количестве товаров в корзине, обновлять список товаров в каталоге и блокировать или разблокировать взаимодействие с элементами страницы в зависимости от определенных условий.

#### Конструктор класса:

```
constructor(container: HTMLElement, events: IEvents) - конструктор класса, который инициализирует компонент страницы, получая контейнер страницы и объект событий events. В конструкторе устанавливается обработчик события клика на элемент корзины для открытия списка товаров в корзине.
```

#### Класс имеет такие методы:

```
1. set counter(value: number) -  метод для установки значения счетчика товаров в корзине;
2. set catalog(items: HTMLElement[]) - метод для установки элементов каталога товаров;
3. set locked(value: boolean) - метод для установки состояния блокировки (locked) обертки страницы.
```

### 6. Класс Card

Этот класс позволяет выводить данные о товаре на страницу.

#### Конструктор класса:

```
constructor(protected blockName: string, container: HTMLElement actions?: ICardActions) - конструктор класса, который инициализирует элементы карточки, устанавливает обработчик клика и сохраняет ссылки на элементы для последующего использования в классе. Принимает три параметра: blockName (название блока), container (элемент контейнера) и необязательный параметр actions (действия, связанные с карточкой). В конструкторе вызывается конструктор родительского класса с параметром container, что инициализирует базовый класс Component и устанавливает элементы в указанном контейнере. Затем, используя функцию ensureElement, создаются и сохраняются ссылки на элементы карточки. Далее проверяется наличие функции обработчика onClick в переданных действиях actions. Это позволяет обрабатывать действие по клику на карточку или на кнопку в зависимости от наличия указанного элемента.
```

#### Класс имеет такие методы:

```
1. set/get id(value: string) - сеттер и геттер для id;
2. set/get title(value: string) - сеттер и геттер для названия;
3. set/get price(value: string) - сеттер и геттер для цены;
4. set image(value: string) - сеттер для изображения;
5. set category(value: CategoryType) - сеттер для категории.
```

### 7. Класс Order

Этот класс представляет компонент формы заказа на веб-странице.

#### Конструктор класса:

```
constructor(container: HTMLFormElement, events: IEvents) - конструктор класса, который инициализирует компонент формы заказа, получая контейнер формы и объект событий events.
```

#### Класс имеет такие методы:

```
1. set phone(value: string) - метод для установки значения телефона в поле формы;
2. set email(value: string) - метод для установки значения email в поле формы.
```

### 8. Класс LarekApi

Является подклассом класса Api и реализует интерфейс ILarekApi. Он представляет собой API для взаимодействия с сервером, связанного с товарами и заказами.

#### Конструктор класса:

```
constructor(baseUrl: string, options?: RequestInit) - устанавливается базовый URL для запросов и опции RequestInit.
```

#### Класс имеет такие методы:

```
1. getProductItem(id: string): Promise<IProductItem> - отправляет GET запрос на сервер для получения информации о товаре по его идентификатору;
2. getProducts(): Promise<IProductItem[]> - отправляет GET запрос на сервер для получения списка товаров;
3. orderLots(order: IOrder): Promise<IOrderResult> - отправляет POST запрос на сервер с информацией о заказе.
```

## Ключевые типы данных

```
// тип, описывающий ошибки валидации форм
export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

// интерфейс, описывающий карточку товара
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

// интерфейс модели приложения
export interface IAppState {
	catalog: IProductItem[];
	basket: string[];
	order: IOrderForm | null;
	preview: string | null;
}

// интерфейс для формы заказа
export interface IOrderForm {
	payment: string;
	address: string;
	items: string[];
	total: number;
	email: string;
	phone: string;
}

// интерфейс для формы
export interface IOrder extends IOrderForm {
	total: number;
	items: string[];
}

// интерфейс для формы контактов
export interface IContactForm {
	email: string;
	phone: string;
}

// интерфейс для результата выполнения операции заказа
export interface IOrderResult {
	id: string;
}
```

## Описание событий

```

```
