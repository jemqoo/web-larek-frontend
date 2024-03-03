import { Form } from './common/Form';
import { IOrderForm, IContactForm } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

export class OrderForm extends Form<IOrderForm> {
	protected _button: HTMLElement;
	protected _buttonCash: HTMLElement;
	protected _buttonCard: HTMLElement;
	protected _address: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._button = this.container.querySelector('.order__button');
		this._buttonCash = this.container.elements.namedItem(
			'cash'
		) as HTMLButtonElement;
		this._buttonCard = this.container.elements.namedItem(
			'card'
		) as HTMLButtonElement;
		this._address = ensureElement<HTMLInputElement>(`.form__input`, container);

		if (this._buttonCash) {
			this._buttonCash.addEventListener('click', () => {
				this._buttonCash.classList.add('button_alt-active');
				this._buttonCard.classList.remove('button_alt-active');
				this.events.emit('order:changed');
			});
		}

		if (this._buttonCard) {
			this._buttonCard.addEventListener('click', () => {
				this._buttonCard.classList.add('button_alt-active');
				this._buttonCash.classList.remove('button_alt-active');
				this.events.emit('order:changed');
			});
		}

		this._address.addEventListener('input', () => {
			this.events.emit('order:changed');
		});
	}

	isSelected() {
		return !!this.container.querySelector('.button_alt-active');
	}

	isAddressSet() {
		return !!this._address.value;
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	clearOrder() {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			'';
		this._buttonCash.classList.remove('button_alt-active');
		this._buttonCash.classList.remove('button_alt-active');
	}
}

// Класс ContactForm управляет формой контактных данных пользователя
export class ContactForm extends Form<IContactForm> {
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
			this.events.emit('contacts:changed', this._errors);
		});
		this._phone.addEventListener('input', () => {
			this.events.emit('contacts:changed', this._errors);
		});
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	isEmail() {
		return !!this._email.value;
	}

	isPhone() {
		return !!this._phone.value;
	}

	clearContact() {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value = '';
		(this.container.elements.namedItem('email') as HTMLInputElement).value = '';
	}
}
