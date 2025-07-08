export interface IServiceBaseData {
    id: number;
    name: string;
}

export interface IServicePageData extends IServiceBaseData {
    price: number;
    time: number;
    desc: string;
}

export interface IServiceData extends IServicePageData {
    service_pays: IServicePayPageData[]
}

export interface IServicePayBaseData {
    id: number;
    service_id: number;
}

export interface IServicePayExtendData {
    platform: string;
    price: number;
    salary_price: number;
    time?: number;
    is_write?: boolean;
}

export interface IServicePayPageData extends IServicePayBaseData, Omit<IServicePayExtendData, 'salary_price'> {

}