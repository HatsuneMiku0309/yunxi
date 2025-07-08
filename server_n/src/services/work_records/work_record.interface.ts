import { IJWTPayload } from "../authentication/authentication.interface";
import { IServicePayRow } from "../services/service.interface";

export interface IWorkRecordRow {
  id: number;
  room_id?: number;
  service_id?: number;
  worker_id?: number;
  start_time?: Date;
  end_time?: Date;
  addition: TAddition;
  service_pay_id?: number;
  service_pay_platform?: string;
  service_pay_price?: number;
  service_pay_time?: number;
  service_pay_is_write?: boolean;
  service_pay_salary_price?: number;
  other_pay_price?: number;
  bonus_price?: number;
  extend_price?: number;
  desc?: string;
  service_status: EWorkRecordServiceStatus;
  status: EWorkRecordStatus;
  pay_time?: Date;
}

export enum EWorkRecordStatus {
    unpay,
    payed,
    finish, // finish时，直接转换包间/技师/service_status(finish)，技师绑定的钟是当前的直接下钟，否则不动。
    cancel // 取消
}

export enum EWorkRecordServiceStatus {
    idle,
    run,
    finish
}

export type TAddition = 'assign' | 'increase' | 'none';

export interface IWorkRecordPayActionPayload {
  service_id: number;
  addition: TAddition;
  service_pay_id: IServicePayRow['id'];
  other_pay_price?: string;
  bonus_price: string;
  extend_price: string;
  discount_price: string;
  desc: string;
}

export interface IWorkRecordCreateOrUpdatePayload {
  other_pay_price?: number;
  room_id?: number;
  service_id?: number;
  service_pay_id?: number;
  status: EWorkRecordStatus;
  worker_id?: number;
}
export interface IWorkRecordClockInPayload {
  room_id: number;
  worker_id: number;
  service_id: number;
  work_record_id: number;
  addition: TAddition;
}

export interface IWorkRecordService {
  getAll(query: any, options: { user: IJWTPayload }): Promise<IWorkRecordRow[]>;
  actionPay(id: string, body: IWorkRecordPayActionPayload): Promise<{ id: string }>;
  actionCancel(id: string): Promise<{ id: string }>;
  clockIn(body: IWorkRecordClockInPayload): Promise<{ id: number }>;
  clockOut(id: string, options: { user: IJWTPayload }): Promise<{ id: string }>;
  create(body: IWorkRecordCreateOrUpdatePayload): Promise<{ id: number }>;
  update(id: string, body: IWorkRecordCreateOrUpdatePayload): Promise<{ id: number }>;
}