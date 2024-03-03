import { Component } from './base/Component';
import { ICardBasked, IActions, ensureElement } from '../utils/utils';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard {
	category?: string;
	title: string;
	description?: string | string[];
	image?: string;
	price: string | number;
	itemIndex?: number;
	_button?:HTMLButtonElement;
}

export class Card<T> extends Component<ICard> {
	protected _title: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _price: HTMLElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
		this._button = container.querySelector(`.${blockName}__button`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set price(value: string) {
		if (value === null) {
			value = 'Бесценно';
			this.setText(this._price, value);
			this.setDisabled(this._button, true);
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}

	get price(): string {
		return this._price.textContent || '';
	}
}

export interface ICatalogItem {
	category?: string;
	image?: string;
	description?: string | string[];
}

export class CatalogItem extends Card<ICatalogItem> {
	protected _category?: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _price: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);

		this._category = ensureElement<HTMLElement>(`.card__category`, container);
		this._image = ensureElement<HTMLImageElement>(`.card__image`, container);
		this._description = container.querySelector(`.card__text`);
	}

	set category(value: string) {
		if (value === 'софт-скил') {
			this._category.classList.add('card__category_soft');
		} else if (value === 'другое') {
			this._category.classList.add('card__category_other');
		} else if (value === 'хард-скил') {
			this._category.classList.add('card__category_hard');
		} else if (value === 'дополнительное') {
			this._category.classList.add('card__category_additional');
		} else if (value === 'кнопка') {
			this._category.classList.add('card__category_button');
		}
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._description, value);
		}
	}
}

export class CardBasked extends Card<ICardBasked> {
	protected _itemIndex?: HTMLElement;

	constructor(container: HTMLElement, actions?: IActions) {
		super('card', container, actions);
		this._itemIndex = ensureElement<HTMLElement>(
			`.basket__item-index`,
			container
		);
		this._button = ensureElement<HTMLButtonElement>(
			`.basket__item-delete`,
			container
		);
	}

	set itemIndex(value: number) {
		this.setText(this._itemIndex, value);
	}
}
