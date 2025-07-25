import type { TAddition } from "./clockIn";
import type { IClockOutPageData } from "./clockOut";
import type { IRoomBaseData } from "./room";
import type { IServiceBaseData, IServicePayBaseData, IServicePayExtendData, IServicePayPageData } from "./service";
import type { IWorkerBaseData } from "./worker";

export enum EPayMode {
    pay,
    cancel
}

export enum EEditMode {
    create,
    modify
}

export enum EReceivingPaymentStatus {
    unpay,
    payed,
    finish, // finish时，直接转换包间/技师/service_status(finish)，技师绑定的钟是当前的直接下钟，否则不动。
    cancel // 取消
}

export enum EReceivingPaymentServiceStatus {
    idle,
    run,
    finish
}

export const convertWorkRecordStatusToCNString: {[k in keyof typeof EReceivingPaymentStatus]: string} = {
    unpay: '未付款',
    payed: '已付款',
    finish: '完成',
    cancel: '取消'
}

export const convertWorkRecordServiceStatsuToCNString: {[k in keyof typeof EReceivingPaymentServiceStatus]: string} = {
    idle: '等待',
    run: '执行',
    finish: '完成'
}

export interface IReceivingPaymentServiceData extends IServiceBaseData {
    service_pays: Omit<IServicePayPageData, 'salary_price'>[]
}

export interface IReceivingPaymentBaseData extends IClockOutPageData {
    worker_id?: number;
    service_id?: number;
    addition: TAddition;
    service_pay_id?: IServicePayBaseData['id'];
    service_pay_platform?: IServicePayExtendData['platform'];
    service_pay_price?: IServicePayExtendData['price'];
    service_pay_salary_price?: IServicePayExtendData['salary_price'];
    service_pay_time?: IServicePayExtendData['time'];
    service_pay_is_write?: IServicePayExtendData['is_write'];
    other_pay_price?: number;
    bonus_price?: number;
    extend_price?: number;
    desc?: string;
    service_status: EReceivingPaymentServiceStatus;
    status: EReceivingPaymentStatus;
    pay_time: Date;
}

export interface IReceivingPaymentActionPayload {
    addition: TAddition;
    service_id: IServiceBaseData['id'];
    service_pay_id: IServiceBaseData['id'];
    other_pay_price?: string;
    bonus_price: string;
    discount_price: string;
    extend_price: string;
    desc: string;
    member_id?: string;
}


/**
 * 新增以及修改payload
 * 
 * @description
 * id未填写时，新增两种情况：
 * 
 *  【已付款】：
 * 
 *      1. 已带入包间，后续上钟补写worker
 *      2. 未带入包间，后续上钟补写room/worker
 * @example
 * 
 *      { room_id: 1, service_id: 1, service_pay: { id: 1, service_id: 1, platform: '美团', price: 80 }, status: EReceivingPaymentStatus.payed }
 *      { service_id: 1, service_pay: { id: 1, service_id: 1, platform: '美团', price: 80 }, status: EReceivingPaymentStatus.payed }
 * @description
 *  【等待】：
 *
 *      1. 上钟后选择worker/service
 * @example
 * 
 *      { room_id: 1 }
 *      { room_id: 1, service_id: 1, service_pay: { id: 1, service_id: 1, platform: '美团', price: 80 } }
 * @description
 * id填写，修改：
 * 
 *      1. 允许修改room_id/worker_id/service_id
 * @example
 * 
 *      { id: 1, room_id: 2 } // 换房 (转换房间状态)
 *      { id: 1, worker_id: 2 } // 换技师 (转换技师状态)
 *      { id: 1, service_id: 2 } // 换服务 (已付款的不可转换)
 *      { id: 1, room_id: 2, service_id: 2 } // 多项 (转换多项)
 *      ...
 */
export interface IReceivingPaymentCreateOrUpdatePayload {
    room_id?: IRoomBaseData['id'];
    service_id?: IServiceBaseData['id'];
    worker_id?: IWorkerBaseData['id'];
    service_pay_id?: IServicePayBaseData['id'] | null;
    other_pay_price?: number | null;
    status: EReceivingPaymentStatus;
}