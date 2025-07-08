export interface IServiceRow {
  id: number;
  name: string;
  price: number;
  time: number;
  desc?: string;
  order: number;
  create_time?: Date;
  update_time?: Date;
  enabled?: boolean;
}

export interface IServicePayRow {
  id: number;
  service_id: number;
  platform: string;
  price: number;
  salary_price: number;
  time: number;
  is_write?: boolean;
  create_time?: Date;
  update_time?: Date;
}

export interface IServiceService {
  getAll(): Promise<IServiceRow[]>;
}

export interface IServicePayService {
  getAll(): Promise<IServicePayRow[]>;
  getByServiceId(serviceID: string): Promise<IServicePayRow[]>
}