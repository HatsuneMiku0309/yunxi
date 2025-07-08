export enum EPlatform {
    meituan,
    douyin,
    gaode,
    self
}

export interface ISettingPlatform {
    id: number;
    name: string;
    cn_name: string;
    commission: number;
}

export interface ISettingBaseSetting {
    id: number;
    name: string;
    value: number;
    value_str: string;
}