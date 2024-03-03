import { Model } from './base/Model';
import { FormErrors, IAppState, ILotItem, IOrder, IOrderForm } from '../types';

export type CatalogChangeEvent = {
	catalog: LotItem[];
};

export class LotItem extends Model<ILotItem> {
	category: string;
	description: string;
	id: string;
	image: string;
	price: number;
	title: string;
}

export class AppData extends Model<IAppState> {
	basket: LotItem[] = [];
	catalog: LotItem[];
	order: IOrder = {
		payment: '',
		email: ' ',
		phone: ' ',
		address: '',
		total: 0,
		items: [],
	};
	formErrors: FormErrors = {};

	setCatalog(items: ILotItem[]) {
		this.catalog = items.map((item) => new LotItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setBasket(item: LotItem) {
		this.basket.push(item);
		this.emitChanges('basket:changed');
	}

	removeBasket(item: LotItem) {
		this.basket = this.basket.filter((el) => el.id != item.id);
		this.emitChanges('basket:changed');
	}

	clearData() {
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

	getTotal(): number {
		this.order.total = this.basket.reduce((a, b) => {
			return a + b.price;
		}, 0);
		return this.basket.reduce((a, b) => {
			return a + b.price;
		}, 0);
	}

	setPreview(item: LotItem) {
		this.emitChanges('preview:changed', item);
	}

	getClosedLots() {
		const seen: { [key: string]: boolean } = {};

		this.basket = this.basket.filter(function (item: LotItem) {
			const k: string = JSON.stringify(item);
			return seen.hasOwnProperty(k) ? false : (seen[k] = true);
		});
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
		if (!this.order.address) {
			errors.address = 'Неоходимо указать адрес';
		}
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
