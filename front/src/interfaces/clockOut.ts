import type { IRoomBaseData } from "./room";
import type { IServiceBaseData } from "./service";
import type { IWorkerBaseData } from "./worker";

export interface IClockOutPageData {
    id: number;
    worker?: IWorkerBaseData;
    room?: IRoomBaseData;
    service?: IServiceBaseData;
    start_time?: string;
    end_time?: string;
}
