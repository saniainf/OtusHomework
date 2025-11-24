# homework-04

Интернет-магазин с каталогом товаров, корзиной и оформлением заказа.

## Описание проекта

Приложение представляет собой полнофункциональный интернет-магазин, демонстрирующий работу с API, формами, валидацией и взаимодействием компонентов в Vue 3.

### Основные возможности

- **Каталог товаров** — загрузка и отображение списка товаров из FakeStore API
- **Поиск** — фильтрация товаров по названию в реальном времени
- **Категории** — фильтрация товаров по категориям через выпадающий список
- **Постраничная загрузка** — отображение товаров порциями с кнопкой "Показать ещё"
- **Карточки товаров** — просмотр краткой информации с изображением, ценой и рейтингом
- **Детальный просмотр** — модальное окно с полным описанием товара
- **Корзина** — добавление товаров, отображение списка и общей суммы
- **Оформление заказа** — форма с валидацией для отправки данных на сервер
- **Отправка на сервер** — POST-запрос с данными заказа на httpbin.org

### Ключевые концепции Vue 3

#### Composition API

- **`<script setup>`** — современный синтаксис для создания компонентов
- **`ref`** — реактивные примитивные значения (строки, числа, булевы)
- **`shallowRef`** — оптимизированная реактивность для больших массивов
- **`computed`** — вычисляемые свойства, кешируемые и пересчитываемые при изменении зависимостей
- **`watch` / `watchEffect`** — наблюдение за изменениями реактивных данных

#### Жизненный цикл

- **`onMounted`** — хук, выполняющийся после монтирования компонента в DOM (загрузка данных с сервера)

#### Взаимодействие компонентов

- **Props** — передача данных от родителя к дочернему компоненту
- **Emits** — отправка событий от дочернего компонента к родителю
- **`defineProps`** — объявление входных параметров компонента
- **`defineEmits`** — объявление событий компонента

#### Двусторонняя привязка

- **`v-model`** — синхронизация значения между компонентом и родителем
- **Custom v-model** — создание собственных моделей через `modelValue` и `update:modelValue`
- **Multiple v-models** — использование нескольких именованных моделей (`v-model:searchValue`)

#### Директивы

- **`v-for`** — рендеринг списков с уникальными ключами
- **`v-if` / `v-else`** — условный рендеринг элементов
- **`v-show`** — переключение видимости через CSS (display: none)
- **`@click` / `@blur`** — обработка событий

#### Валидация форм

- **Vuelidate** — библиотека для валидации форм
- **`useVuelidate`** — хук для создания объекта валидатора
- **Встроенные правила** — `required`, `email`, `minLength`, `helpers.withMessage`
- **Реактивная валидация** — проверка полей при вводе и `@blur`

#### Работа с API

- **`async/await`** — асинхронные функции для HTTP-запросов
- **Fetch API** — загрузка данных с внешних API
- **Обработка ошибок** — try-catch для перехвата сетевых ошибок

### Структура компонентов

```text
App.vue (главный компонент)
├── SearchPanel.vue (поиск товаров)
├── FilterPanel.vue (фильтр по категориям)
├── ProductCard.vue (карточка товара)
├── ProductDetailsModal.vue (детальная информация)
├── BasketPanel.vue (корзина)
└── CheckoutModal.vue (форма оформления заказа)
```

### Утилиты

- **`loadProducts()`** — загрузка всех товаров
- **`loadProduct(id)`** — загрузка конкретного товара
- **`checkout(items, data)`** — отправка заказа на сервер
- **`productWord(count)`** — правильное склонение слова "товар"
- **`toStarsHTML(num, total)`** — генерация HTML для рейтинга звёздами

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Compile and Minify for Production

```sh
bun run build
```
