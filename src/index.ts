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
import { IOrderForm, IContactForm, IOrder } from './types';
import { Order } from './components/Order';
import { Success } from './components/common/Success';

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
// const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// // Дальше идет бизнес-логика
// // Поймали событие, сделали что нужно

// // Изменения в лоте, но лучше все пересчитать
// events.on('auction:changed', () => {
// 	page.counter = appData.getClosedLots().length;
// 	bids.items = appData.getActiveLots().map((item) => {
// 		const card = new BidItem(cloneTemplate(cardBasketTemplate), {
// 			onClick: () => events.emit('preview:changed', item),
// 		});
// 		return card.render({
// 			title: item.title,
// 			image: item.image,
// 			status: {
// 				amount: item.price,
// 				status: item.isMyBid,
// 			},
// 		});
// 	});
// 	let total = 0;
// 	basket.items = appData.getClosedLots().map((item) => {
// 		const card = new BidItem(cloneTemplate(soldTemplate), {
// 			onClick: (event) => {
// 				const checkbox = event.target as HTMLInputElement;
// 				appData.toggleOrderedLot(item.id, checkbox.checked);
// 				basket.total = appData.getTotal();
// 				basket.selected = appData.order.items;
// 			},
// 		});
// 		return card.render({
// 			title: item.title,
// 			image: item.image,
// 			status: {
// 				amount: item.price,
// 				status: item.isMyBid,
// 			},
// 		});
// 	});
// 	basket.selected = appData.order.items;
// 	basket.total = total;
// });

// // Открытие корзины
// events.on('basket:open', () => {
// 	const basketItems = appData.basket.map((item, index) => {
// 		const basketCard = new BasketCard(cloneTemplate(cardBasketTemplate), {
// 			onClick: () => events.emit('basket:delete', item),
// 		});
// 		return basketCard.render({
// 			title: item.title,
// 			price: item.price,
// 			index: index + 1,
// 		});
// 	});
// 	modal.render({
// 		content: basket.render({
// 			total: appData.getTotal(),
// 		}),
// 	});
// });

///////////////////////////////////

// Открыть товар
events.on('card:select', (item: ProductItem) => {
	appData.setPreview(item);
});

// Изменились элементы каталога
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

// Открыть превью товара
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

// Изменен открытый выбранный товар

// Добавление товара в корзину
events.on('basket:add', (item: ProductItem) => {
	appData.setBasket(item);
	page.counter = appData.getTotal();
	modal.close();
});

// Открыть корзину
events.on('basket:open', () => {
	const items = appData.basket.map((item, index) => {
		const product = new BasketCard(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('basket:delete', item),
		});
		return product.render({
			index: index + 1,
			title: item.title,
			description: item.description,
			price: item.price?.toString() || '0',
			category: item.category,
		});
	});
	modal.render({
		content: createElement<HTMLElement>('div', {}, [
			basket.render({
				items,
				total: appData.getTotal(),
			}),
		]),
	});
});

// Удаление товара из корзины
events.on('basket:add', (item: ProductItem) => {
	appData.removeProduct(item);
});

// Отправлена форма заказа
events.on('order:submit', () => {
	api
		.orderLots(appData.order)
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					events.emit('auction:changed');
				},
			});

			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Очистить заказ и корзину

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	order.valid = !email && !phone;
	order.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей

// Открыть форму заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
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
