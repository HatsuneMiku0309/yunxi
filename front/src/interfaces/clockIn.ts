
import type { IRoomBaseData } from "./room";
import type { IServiceBaseData } from "./service";
import type { IWorkerBaseData } from "./worker";

export interface IClockInPageData {
    roomID: IRoomBaseData['id'];
    serviceID: IServiceBaseData['id'];
    workerID: IWorkerBaseData['id'];
    addition: TAddition;
}

export type TAddition = 'assign' | 'increase' | 'none';
export enum EAddtionToCNString {
    assign = '点钟',
    increase = '加钟',
    none = '无'
}

export interface IClockInPayload {
    work_record_id?: number;
    worker_id?: number;
    room_id?: number;
    service_id?: number;
    addition: TAddition
}