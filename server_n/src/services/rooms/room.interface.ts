import { PoolClient } from "pg";

export interface IRoomRow {
  id: number;
  no: string;
  name?: string;
  status: ERoomStatus;
  create_time?: Date;
  update_time?: Date;
}

export enum ERoomStatus {
    idle,
    using,
    reserve,
    clean,
    close,
}

export interface IRoomExtendsRow {
  id: number;
  room_id: number;
  worker_id?: number;
  service_id?: number;
  work_record_id?: number;
  create_time?: Date;
  update_time?: Date;
}

export interface IRoomUsingPayload {
  datas: {
    service_id?: number;
    worker_id?: number;
    work_record_id?: number;
  }[],
  desc: string;
}

export interface IRoomService {
  getAll(): Promise<IRoomRow[]>;
  actionIdle(id: string): Promise<{ id: string }>;
  actionUsing(id: string, body: IRoomUsingPayload): Promise<{ id: string }>;
  dbActionUsing(conn: PoolClient, id: string, body: IRoomUsingPayload): Promise<{ id: string }>;
  actionReserve(id: string): Promise<{ id: string }>;
  actionClean(id: string): Promise<{ id: string }>;
  actionClose(id: string): Promise<{ id: string }>;
}

export interface IRoomExtendsService {
  getByRoomId(room_id: number): Promise<IRoomExtendsRow[]>;
  removeByRoomId(room_id: number): Promise<{ id: number }[]>;
  dbRemoveByRoomId(conn: PoolClient, room_id: number): Promise<{ id: number }[]>;
}