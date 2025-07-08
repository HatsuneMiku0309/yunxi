import type { IWorkerBaseData } from '@interfaces/worker';
import type { IServiceBaseData } from '@interfaces/service';

export interface IRoomBaseData {
    id: number;
    no: string;
    name: string;
    desc: string;
}

export interface IRoomExtendsBaseData {
    id: number;
    room_id: number;
    worker_id: IWorkerBaseData['id'];
    service_id: IServiceBaseData['id'];
}

export interface IRoomExtendData {
    worker?: IWorkerBaseData;
    service?: IServiceBaseData;
    work_record_id?: number;
}

export interface IRoomPageData extends IRoomBaseData {
    extends: IRoomExtendData[];
    status: ERoomStatus;
}

export enum ERoomStatus {
    idle,
    using,
    reserve,
    clean,
    close,
}

export const convertRoomEnumNameToCNString: {[k in keyof typeof ERoomStatus]: string} = {
    idle: '闲置',
    using: '使用',
    reserve: '预定',
    clean: '打扫',
    close: '停用'
};

export const roomStatusShowColor: {[k in ERoomStatus]: string} = {
    [ERoomStatus.idle]: 'blue',
    [ERoomStatus.using]: 'red',
    [ERoomStatus.reserve]: 'orange',
    [ERoomStatus.clean]: 'purple',
    [ERoomStatus.close]: 'black',
};


export interface IRoomUsingPayload {
    worker_id?: IWorkerBaseData['id'];
    service_id?: IServiceBaseData['id'];
}