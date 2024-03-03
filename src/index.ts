import './scss/styles.scss';
import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppData, CatalogChangeEvent, LotItem } from './components/AppData';
import { Page } from './components/Page';
import { CardBasked, CatalogItem } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { IOrderForm, IContactForm, IOrder } from './types';
import { OrderForm, ContactForm } from './components/Order';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);

// В режиме разработки отображает конкретную команду в данный момент
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppData({}, events);

// Получаем данные с сервера
api
	.getLotList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});

// Глобальные контейнеры
const page = new Page(document.body, events, {
	onClick: () => {
		events.emit('basket:changed');
		events.emit('basket:open');
	},
});

// Переиспользуемые части интерфейса
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contact = new ContactForm(cloneTemplate(contactsTemplate), events);
const basket = new Basket(cloneTemplate(basketTemplate), events, {
	onClick: () => {
		events.emit('order:open');
	},
});

// Вывод карточки
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});

		return card.render({
			category: item.category,
			title: item.title,
			image: item.image,
			price: item.price,
		});
	});
});

// Открыть карточку
events.on('card:select', (item: LotItem) => {
	appData.setPreview(item);
	// if(item.price === null) {
	//   ff
	// }
});

// Открытая карточка
events.on('preview:changed', (item: LotItem) => {
	const showItem = (item: LotItem) => {
		const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
			onClick: () => events.emit('basket:add', item),
		});

		modal.render({
			content: card.render({
				category: item.category,
				title: item.title,
				image: item.image,
				description: item.description,
				price: item.price,
			}),
		});

		const basketButton = document.querySelector('.card__button');
		if (basketButton) {
			basketButton.addEventListener('click', () => {
				modal.close();
			});
		}
	};

	if (item) {
		api
			.getLotItem(item.id)
			.then(() => {
				showItem(item);
			})
			.catch((err) => {
				console.error(err);
			});
	} else {
		modal.close();
	}
});

// Открыть корзину
events.on('basket:open', () => {
	modal.render({
		content: createElement<HTMLElement>('div', {}, [basket.render()]),
	});
});

// изменения в корзине
events.on('basket:changed', () => {
	appData.getClosedLots();
	basket.items = appData.basket.map((item, i) => {
		const basketItem = new CardBasked(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('basket:remove', item), // удаление карточки из корзины
		});

		return basketItem.render({
			itemIndex: i + 1,
			title: item.title,
			price: item.price,
		});
	});

	basket.disabled = appData.basket.length;
	page.counter = appData.basket.length;
	basket.total = appData.getTotal();
});

// добавления карточки в корзину
events.on('basket:add', (item: LotItem) => {
	appData.setBasket(item);
});

// удаление карточки из корзины
events.on('basket:remove', (item: LotItem) => {
	appData.removeBasket(item);
});

// Открыть форму заказа
events.on('order:open', () => {
	appData.setOrderField('payment', appData.getTotal());
	modal.render({
		content: order.render({
			valid: false,
			errors: [],
		}),
	});
});

// Открыть форму контакта
events.on('order:submit', () => {
	appData.basket.forEach((order) => {
		appData.setOrderField('items', order.id);
	});
	modal.render({
		content: contact.render({
			valid: false,
			errors: [],
		}),
	});
});

// Изменилось одно из полей
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

// ИЗМЕНЕНИЕ СОСТОЯНИЯ ФОРМЫ ОПЛАТЫ
events.on('order:changed', () => {
	order.valid = order.isAddressSet() && order.isSelected();
});

// ИЗМЕНЕНИЕ СОСТОЯНИЯ ФОРМЫ С КОНТАКТНЫМИ ДАННЫМИ
events.on('contacts:changed', () => {
	contact.valid = contact.isEmail() && contact.isPhone();
});

// Изменение состояния валидации форм
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone, address } = errors;
	order.errors = contact.errors = Object.values({ email, phone, address })
		.filter((i) => !!i)
		.join('; ');
});

// ОТКРЫТИЕ УСПЕШНОГО ЗАКАЗА
events.on('contacts:submit', () => {
	api
		.orderLots(appData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appData.clearData();
					page.counter = 0;
					contact.clearContact();
					order.clearOrder();
				},
			});

			modal.render({
				content: success.render({
					description: appData.getTotal(), // выводим общую сумму заказа
				}),
			});
		})
		.catch((err) => {
			console.error(err);
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
