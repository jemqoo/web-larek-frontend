import { Api, ApiListResponse } from './base/api';
import { IOrder, IOrderResult, ILotItem } from '../types';

export interface ILarekAPI {
	getLotList: () => Promise<ILotItem[]>;
	getLotItem: (id: string) => Promise<ILotItem>;
	orderLots: (order: IOrder) => Promise<IOrderResult>;
}

export class LarekAPI extends Api implements ILarekAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getLotList(): Promise<ILotItem[]> {
		return this.get('/product').then((data: ApiListResponse<ILotItem>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	getLotItem(id: string): Promise<ILotItem> {
		return this.get(`/product/${id}`).then((item: ILotItem) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	orderLots(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
