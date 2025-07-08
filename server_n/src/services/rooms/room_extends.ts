import { PoolClient } from "pg";
import { IPgDb } from "../../db.interface";
import { IRoomExtendsRow, IRoomExtendsService } from "./room.interface";
import * as _ from 'lodash';

export class RoomExtendsService implements IRoomExtendsService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async removeByRoomId(room_id: number): Promise<{ id: number; }[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      return await this.dbRemoveByRoomId(conn, room_id);
    } finally {
      conn.release();
    }
  }

  async dbRemoveByRoomId(conn: PoolClient, room_id: number): Promise<{ id: number; }[]> {
    const { rows } = await conn.query<{ id: number }>('DELETE FROM room_extends WHERE room_id = $1 RETURNING id', [room_id]);

    return rows;
  }

  async getByRoomId(room_id: number): Promise<IRoomExtendsRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query('SELECT * FROM room_extends WHERE room_id = $1', [room_id]);

      return rows;
    } finally {
      conn.release();
    }
  }
}