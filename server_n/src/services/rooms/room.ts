import { PoolClient } from "pg";
import { IPgDb } from "../../db.interface";
import { Utils } from "../utils";
import { ERoomStatus, IRoomExtendsRow, IRoomExtendsService, IRoomRow, IRoomService, IRoomUsingPayload } from "./room.interface";
import * as _ from 'lodash';

export class RoomService implements IRoomService {
  private readonly _pgDb: IPgDb;
  private readonly _utils: Utils;
  constructor(pgDB: IPgDb, utils: Utils) {
      this._pgDb = pgDB;
      this._utils = utils;
  }
  async actionIdle(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await conn.query('UPDATE rooms SET status = $1, "desc" = $2, update_time = $3 WHERE id = $4', [ERoomStatus.idle, '', new Date(), id]);
      const roomExtends = <IRoomExtendsService>this._utils.get('roomExtends');
      await roomExtends.dbRemoveByRoomId(conn, Number(id))
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }

  async actionUsing(id: string, body: IRoomUsingPayload): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      return await this.dbActionUsing(conn, id, body);
    } finally {
      conn.release();
    }
  }

  async dbActionUsing (conn: PoolClient, id: string, body: IRoomUsingPayload): Promise<{ id: string }> {
    const roomExtends = <IRoomExtendsService>this._utils.get('roomExtends');
    await roomExtends.dbRemoveByRoomId(conn, Number(id))
    let _body = body.datas.map((b) => {
      let _b = {
        worker_id: b.worker_id,
        service_id: b.service_id ?? null,
        room_id: id,
        work_record_id: b.work_record_id ?? null
      };

      return _b;
    });

    const { fieldSql, valuesSql, values } = this._pgDb.grantInsertBatchSql(_body);
    const sql = `INSERT INTO room_extends ${fieldSql} VALUES ${valuesSql}`;
    if (values.length) {
      await conn.query(sql, values);
    }
    let desc = body.desc ?? '';
    await conn.query('UPDATE rooms SET status = $1, "desc" = $2, update_time = $3 WHERE id = $4', [ERoomStatus.using, desc, new Date(), id]);

    return { id };
  }

  async actionReserve(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await conn.query('UPDATE rooms SET status = $1, "desc" = $2, update_time = $3 WHERE id = $4', [ERoomStatus.reserve, '', new Date(), id]);
      const roomExtends = <IRoomExtendsService>this._utils.get('roomExtends');
      await roomExtends.dbRemoveByRoomId(conn, Number(id))
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }
  async actionClean(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await conn.query('UPDATE rooms SET status = $1, "desc" = $2, update_time = $3 WHERE id = $4', [ERoomStatus.clean, '', new Date(), id]);
      const roomExtends = <IRoomExtendsService>this._utils.get('roomExtends');
      await roomExtends.dbRemoveByRoomId(conn, Number(id))
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }
  async actionClose(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await conn.query('UPDATE rooms SET status = $1, "desc" = $2, update_time = $3 WHERE id = $4', [ERoomStatus.close, '', new Date(), id]);
      const roomExtends = <IRoomExtendsService>this._utils.get('roomExtends');
      await roomExtends.dbRemoveByRoomId(conn, Number(id))
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }


  async getAll(): Promise<IRoomRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query<IRoomRow>('SELECT * FROM rooms ORDER BY id');
      const roomIds = rows.map((row) => row.id);
      const whereSql = rows.map((r, index) => `$${index + 1}`);
      const { rows: extendsRows } = await conn.query<IRoomExtendsRow>(`SELECT * FROM room_extends WHERE room_id in (${whereSql.join(', ')})`, roomIds);
      const { workerIds, serviceIds } = _.reduce(extendsRows, (_r, v) => {
        if (v.worker_id && !_r.workerIds.includes(v.worker_id))
          _r.workerIds.push(v.worker_id);
        if (v.service_id && !_r.serviceIds.includes(v.service_id))
          _r.serviceIds.push(v.service_id);

        return _r;
      }, <{ workerIds: number[], serviceIds: number[] }>{ workerIds: [], serviceIds: [] });
  
      const workerWhereSql = workerIds.map((b, index) => `$${index + 1}`);
      const serviceWhereSql = serviceIds.map((b, index) => `$${index + 1}`);
      const { rows: workerRows } = workerWhereSql.length ? await conn.query(`SELECT * FROM workers where id in (${workerWhereSql.join(', ')})`, workerIds) : { rows: undefined };
      const { rows: serviceRows } = serviceWhereSql.length ? await conn.query(`SELECT * FROM services where id in (${serviceWhereSql.join(', ')})`, serviceIds) : { rows: undefined };
      
      let extendsDatas = _.map(extendsRows, (e) => {
        let findWorkerById = workerRows?.find((w) => w.id === e.worker_id);
        let findServiceById = serviceRows?.find((s) => s.id === e.service_id);
        let _r = {
          ...e,
          worker: findWorkerById,
          service: findServiceById
        };

        return _r;
      });

      let result = rows.map((r) => {
        let filterExtendsDatas = _.filter(extendsDatas, (e) => e.room_id === r.id);
        let _r = {
          ...r,
          extends: filterExtendsDatas
        }

        return _r;
      });

      return result;
    } finally {
      conn.release();
      }
  }
}