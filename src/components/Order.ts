import { Form } from './common/Form';
import { IOrderForm, IContactForm } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

export class Order extends Form<IOrderForm> {
	protected _card: HTMLButtonElement;
	protected _cash: HTMLButtonElement;
	protected _address: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._card = container.elements.namedItem('card') as HTMLButtonElement;
		this._cash = container.elements.namedItem('cash') as HTMLButtonElement;
		this._address = ensureElement<HTMLInputElement>(`.form__input`, container);

		if (this._cash) {
			this._cash.addEventListener('click', () => {
				this._cash.classList.add('button_alt-active');
				this._card.classList.remove('button_alt-active');
				this.events.emit('order:changed');
			});
		}

		if (this._card) {
			this._card.addEventListener('click', () => {
				this._card.classList.add('button_alt-active');
				this._cash.classList.remove('button_alt-active');
				this.events.emit('order:changed');
			});
		}

		this._address.addEventListener('input', () => {
			this.events.emit('order:changed');
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	isAddress() {
		return !!this._address.value;
	}

	isAltActive() {
		return !!this.container.querySelector('.button_alt-active');
	}

	clearOrder() {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			'';
		this._cash.classList.remove('button_alt-active');
		this._card.classList.remove('button_alt-active');
	}
}

export class Contacts extends Form<IContactForm> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._email = this.container.elements.namedItem(
			'email'
		) as HTMLInputElement;
		this._phone = this.container.elements.namedItem(
			'phone'
		) as HTMLInputElement;

		this._email.addEventListener('input', () => {
			this.events.emit('formErrors:changed', this._errors);
		});
		this._phone.addEventListener('input', () => {
			this.events.emit('formErrors:changed', this._errors);
		});
	}

	// Установка номера телефона
	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	// Установка адреса электронной почты
	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	isPhone() {
		return !!this._phone.value;
	}

	isEmail() {
		return !!this._email.value;
	}

	clearContacts() {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value = '';
		(this.container.elements.namedItem('email') as HTMLInputElement).value = '';
	}
}
