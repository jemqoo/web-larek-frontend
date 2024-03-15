// тип, описывающий ошибки валидации форм
export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

// интерфейс, описывающий карточку товара
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

// интерфейс модели приложения
export interface IAppState {
	catalog: IProductItem[];
	basket: string[];
	order: IOrderForm | null;
}

// интерфейс для формы заказа
export interface IOrderForm {
	payment: string;
	address: string;
	items: string[];
	total: number;
	email: string;
	phone: string;
}

// интерфейс для формы контактов
export interface IContactForm {
	email: string;
	phone: string;
}
