import type { IRoomBaseData } from "./room";
import type { IServiceBaseData } from "./service";

export interface IWorkerBaseData {
    id: number;
    no: string;
    name: string;
}

export interface IWorkerPageData extends IWorkerBaseData {
    status: EWorkerStatus;
    room?: IRoomBaseData;
    service?: IServiceBaseData;
}

export enum EWorkerStatus {
    idle,
    working,
    reserve,
    break,
    leave
}

export const convertWorkerEnumNameToCNString: {[k in keyof typeof EWorkerStatus]: string} = {
    idle: '闲置',
    working: '上钟',
    reserve: '预定',
    break: '暂离',
    leave: '休假'
}

export const workerStatusShowColor: {[k in EWorkerStatus]: string} = {
    [EWorkerStatus.idle]: 'blue',
    [EWorkerStatus.working]: 'red',
    [EWorkerStatus.reserve]: 'orange',
    [EWorkerStatus.break]: 'purple',
    [EWorkerStatus.leave]: 'black'
};

export interface IWorkerLeavePayload {
    leaveDate?: string;
    desc: string;
}

export interface IWorkerWorkingPayload {
    room_id?: IRoomBaseData['id'];
    service_id?: IServiceBaseData['id'];
}