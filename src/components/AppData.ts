import { Model } from './base/Model';
import {
	IProductItem,
	IAppState,
	IOrderForm,
	IOrder,
	FormErrors,
} from '../types';

export class ProductItem extends Model<IProductItem> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

export class AppState extends Model<IAppState> {
	catalog: ProductItem[];
	basket: ProductItem[] = [];
	order: IOrder = {
		items: [],
		payment: ' ',
		total: 0,
		address: '',
		email: ' ',
		phone: ' ',
	};
	preview: string | null;
	formErrors: FormErrors = {};

	setBasket(item: ProductItem) {
		if (this.basket.includes(item)) return;
		this.basket.push(item);
		this.emitChanges('basket:changed');
	}

	setCatalog(items: IProductItem[]) {
		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	removeProduct(item: ProductItem) {
		this.basket = this.basket.filter((el) => el.id !== item.id);
		this.emitChanges('basket:changed');
	}

	clearBasket() {
		this.basket = [];
		this.order = {
			payment: '',
			email: ' ',
			phone: ' ',
			address: '',
			total: 0,
			items: [],
		};
	}

	clearOrder() {
		this.order = {
			items: [],
			payment: ' ',
			total: 0,
			address: '',
			email: ' ',
			phone: ' ',
		};
	}

	getTotal(): number {
		return this.basket.reduce((a, b) => a + b.price, 0);
	}

	setOrderField(field: keyof IOrderForm, value: string | number) {
		if (field === 'total') {
			this.order[field] = value as number;
		} else if (field === 'items') {
			const arr = this.order[field];
			arr.push(value as string);
		} else {
			this.order[field] = value as string;
		}

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		if (!this.order.address) {
			errors.address = 'Неоходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	setPreview(item: ProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}
}
