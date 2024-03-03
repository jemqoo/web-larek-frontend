// интерфейс, описывающий карточку товара
export interface ILotItem {
	id: string;
	title: string;
	category: string;
	description: string;
	image: string;
	price: number | null;
}

// интерфейс модели приложения
export interface IAppState {
	catalog: ILotItem[];
	basket: string[];
	order: IOrder | null;
}

// Интерфейс для формы заказа
export interface IOrderForm {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

// Интерфейс для контактной формы
export interface IContactForm {
	email: string;
	phone: string;
}

//Интерфейс для формы
export interface IOrder extends IOrderForm {
	total: number;
	items: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
	id: string;
}