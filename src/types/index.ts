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
// интерфейс, описывающий форму заказа
export interface IOrderForm {
	payment: string;
	address: string;
}
// интерфейс, описывающий форму контактов
export interface Contacts {
	email: string;
	phone: string;
}
