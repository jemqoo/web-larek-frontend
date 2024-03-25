import { Api, ApiListResponse } from './base/api';
import { IProductItem, IOrder, IOrderResult } from '../types';

export interface ILarekApi {
	getProductItem: (id: string) => Promise<IProductItem>;
	getProducts: () => Promise<IProductItem[]>;
	orderLots: (order: IOrder) => Promise<IOrderResult>;
}

export class LarekApi extends Api implements ILarekApi {
	readonly cdn: string;

	constructor(baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
	}

	getProductItem(id: string): Promise<IProductItem> {
		return this.get(`/lot/${id}`).then((item: IProductItem) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	getProducts(): Promise<IProductItem[]> {
		return this.get('/lot').then((data: ApiListResponse<IProductItem>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	orderLots(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
