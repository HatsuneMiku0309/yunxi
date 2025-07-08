import { IJWTPayload } from "../authentication/authentication.interface";

export interface IWorkerRow {
  id: number;
  no: string;
  name?: string;
  version: number;
  status: EWorkerStatus;
  room_id?: number;
  service_id?: number;
  user_id?: number;
  create_time?: Date;
  update_time?: Date;
  enabled?: boolean;
  work_record_id?: number;
}

export enum EWorkerStatus {
    idle,
    working,
    reserve,
    break,
    leave
}

export interface IWorkerService {
  getAll(options: { user: IJWTPayload}): Promise<IWorkerRow[]>;
  actionIdle(id: string): Promise<{ id: string }>;
  actionReserve(id: string): Promise<{ id: string }>;
  actionBreak(id: string): Promise<{ id: string }>;
  actionLeave(id: string): Promise<{ id: string }>;
}
