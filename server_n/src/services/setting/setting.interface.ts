export interface IPlatformRow {
  id: number;
  name: string;
  cn_name?: string;
  commission: number;
  update_time?: Date;
}

export interface IBaseSettingRow {
  id: number;
  name: string;
  value: number;
  value_str?: number;
  update_time?: Date;
}

export interface ISettingPayload {
  base_settings: IBaseSettingRow[],
  platforms: IPlatformRow[]
}

export interface ISettingService {
  getAll(): Promise<ISettingPayload>;
  update(body: ISettingPayload): Promise<void>;
}
