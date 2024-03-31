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
	order: IOrder | null;
	preview: string | null;
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

// интерфейс для формы
export interface IOrder extends IOrderForm {
	total: number;
	items: string[];
}

// интерфейс для формы контактов
export interface IContactForm {
	email: string;
	phone: string;
}

// интерфейс для результата выполнения операции заказа
export interface IOrderResult {
	id: string;
	total: number;
	error?: string;
}
