import './scss/styles.scss';

import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, ProductItem } from './components/AppData';
import { Page } from './components/Page';
import { BasketCard, CatalogItem } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order, Contacts } from './components/Order';
import { Success } from './components/common/Success';
import { IOrderForm } from './types';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);

const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// // Дальше идет бизнес-логика
// // Поймали событие, сделали что нужно

// Открыть превью товара
events.on('card:select', (item: ProductItem) => {
	appData.setPreview(item);
});

// Отображение товаров
events.on('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			category: item.category,
			price: item.price !== null ? item.price + ' синапсов' : 'Бесценно',
		});
	});
});

// Открытие определенного товара
events.on('preview:changed', (item: ProductItem) => {
	const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('card:add', item);
		},
	});

	modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			description: item.description,
			price: item.price !== null ? item.price + ' синапсов' : 'Бесценно',
		}),
	});
});

// Добавление товара в корзину
events.on('card:add', (item: ProductItem) => {
	appData.setBasket(item);
	page.counter = appData.basket.length;
	modal.close();
});

// Открыть корзину
events.on('basket:changed', () => {
	const items = appData.basket.map((item, index) => {
		const product = new BasketCard(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('basket:delete', item),
		});
		return product.render({
			index: index + 1,
			title: item.title,
			description: item.description,
			price: item.price,
			category: item.category,
		});
	});
	modal.render({
		content: basket.render({
			items,
			total: appData.getTotal(),
		}),
	});
});

// Удаление товара из корзины
events.on('basket:delete', (item: ProductItem) => {
	appData.removeProduct(item);
});

// Клик на кнопку "Оформить"
events.on('order:open', () => {
	appData.setOrderField('payment', appData.getTotal());
	modal.render({
		content: order.render({
			address: ' ',
			valid: false,
			errors: [],
		}),
	});
});

// Активировать кнопку "Далее"
events.on('order:changed', () => {
	order.valid = order.isAddress() && order.isAltActive();
});

// Клик на кнопку "Далее"
events.on('order:submit', () => {
	appData.order.total = appData.getTotal();
	appData.basket.forEach((order) => {
		appData.setOrderField('items', order.id);
	});
	modal.render({
		content: contacts.render({
			valid: false,
			errors: [],
		}),
	});
});

// Активировать кнопку "Оплатить"
events.on('formErrors:changed', () => {
	contacts.valid = contacts.isPhone() && contacts.isEmail();
});

// Клик на кнопку "Оплатить"
events.on('contacts:submit', () => {
	api
		.orderLots(appData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					page.counter = 0;
					events.emit('clear:order');
				},
			});

			modal.render({
				content: success.render({
					description: appData.getTotal(),
				}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Очистить данные после оформления заказа
events.on('clear:order', () => {
	appData.clearBasket();
	appData.clearOrder();
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем лоты с сервера
api
	.getProducts()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});

// Изменение состояния валидации форм
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone, address } = errors;
	order.errors = contacts.errors = Object.values({ email, phone, address })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей
events.on(
	/(^order|^contacts)\..*:change/,
	(data: {
		field: keyof Omit<IOrderForm, 'items' | 'total'>;
		value: string;
	}) => {
		appData.setOrderField(data.field, data.value);
	}
);
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);
