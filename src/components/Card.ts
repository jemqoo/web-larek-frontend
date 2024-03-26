import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard {
	category: string;
	title: string;
	description?: string | string[];
	image: string;
	price: string | number;
	index: number;
}

const CardCategory = {
	['софт-скил']: 'soft',
	['другое']: 'other',
	['кнопка']: 'button',
	['хард-скил']: 'hard',
	['дополнительное']: 'additional',
};

export class Card<T> extends Component<ICard> {
	protected _title: HTMLElement;
	protected _image: HTMLImageElement;
	protected _description: HTMLElement;
	protected _button: HTMLButtonElement;
	protected _category: HTMLElement;
	protected _price: HTMLElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		// this._image = ensureElement<HTMLImageElement>(
		// 	`.${blockName}__image`,
		// 	container
		// );
		this._button = container.querySelector(`.${blockName}__button`);
		this._description = container.querySelector(`.${blockName}__description`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._category = container.querySelector(`.${blockName}__category`);

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

	set price(value: string | null) {
		this.setText(this._price, value ?? '');
	}

	get price(): string {
		return this._price.textContent || null;
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

	set category(value: keyof typeof CardCategory) {
		if (this._category) {
			this.setText(this._category, value);
			const categoryStyle = `card__category_${CardCategory[value]}`;
			this._category.classList.add(categoryStyle);
		}
	}

	get category(): keyof typeof CardCategory {
		return this._category.textContent as keyof typeof CardCategory;
	}
}

export interface IBasketCard {
	index: number;
}

export class BasketCard extends Card<IBasketCard> {
	protected _index: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
		this._button = ensureElement<HTMLButtonElement>(
			`.basket__item-delete`,
			container
		);
	}

	set index(value: number) {
		this.setText(this._index, value.toString());
	}
}
