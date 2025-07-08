import { IPgDb } from "../../db.interface";
import { EWorkerStatus, IWorkerRow, IWorkerService } from "./worker.interface";
import * as _ from 'lodash';
import { IJWTPayload } from "../authentication/authentication.interface";
import { IUserRow } from "../user/user.interface";

export class WorkerService implements IWorkerService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async actionIdle(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await conn.query('DELETE FROM room_extends WHERE worker_id = $1', [id]);
      await conn.query(
        'UPDATE workers SET status = $1, room_id = $2, service_id = $3, update_time = $4 WHERE id = $5',
        [EWorkerStatus.idle, null, null, new Date(), id]
      );
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }

  async actionReserve(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await conn.query('DELETE FROM room_extends WHERE worker_id = $1', [id]);
      await conn.query(
        'UPDATE workers SET status = $1, room_id = $2, service_id = $3, update_time = $4 WHERE id = $5',
        [EWorkerStatus.reserve, null, null, new Date(), id]
      );
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    }finally {
      conn.release();
    }
  }

  async actionBreak(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await conn.query('DELETE FROM room_extends WHERE worker_id = $1', [id]);
      await conn.query(
        'UPDATE workers SET status = $1, room_id = $2, service_id = $3, update_time = $4 WHERE id = $5',
        [EWorkerStatus.break, null, null, new Date(), id]
      );
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    }finally {
      conn.release();
    }
  }

  async actionLeave(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await conn.query('DELETE FROM room_extends WHERE worker_id = $1', [id]);
      await conn.query(
        'UPDATE workers SET status = $1, room_id = $2, service_id = $3, update_time = $4 WHERE id = $5',
        [EWorkerStatus.leave, null, null, new Date(), id]
      );
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    }finally {
      conn.release();
    }
  }

  async getAll(options: { user: IJWTPayload}): Promise<IWorkerRow[]> {
    const { user } = options;
    const conn = await this._pgDb.getPool().connect();
    try {
      const params = [];
      const whereSql = ['enabled = true'];
      let sql = 'SELECT * FROM workers';

      // 不為admin
      if (!user.is_admin) {
        const { rows: userRows } = await conn.query<IUserRow>('SELECT * FROM users WHERE id = $1', [user.id]);
        const row = userRows[0];
        const workerId = row.worker_id;
        // 沒有設置worker_id，直接返空。
        if (!workerId) {
          return []; 
        }

        params.push(workerId);
        whereSql.push('id = $1');
      }

      whereSql.length ? (sql += ` WHERE ${whereSql.join(' AND ')}`) : '';
      sql += ' ORDER BY id';

      const { rows } = await conn.query<IWorkerRow>(sql, params);
      const roomIds = _.uniq(_.reduce(rows, (r, v, k) => {
        if (v.room_id)
          r.push(v.room_id);

        return r;
      }, <number[]>[]));
      const serviceIds = _.uniq(_.reduce(rows, (r, v, k) => {
        if (v.service_id)
          r.push(v.service_id);

        return r;
      }, <number[]>[]));
      const roomWhereSql = roomIds.map((b, index) => `$${index + 1}`);
      const serviceWhereSql = serviceIds.map((b, index) => `$${index + 1}`);
      const { rows: roomRows } = roomWhereSql.length ? await conn.query(`SELECT * FROM rooms where id in (${roomWhereSql.join(', ')})`, roomIds) : { rows: undefined };
      const { rows: serviceRows } = serviceWhereSql.length ? await conn.query(`SELECT * FROM services where id in (${serviceWhereSql.join(', ')})`, serviceIds) : { rows: undefined };
      
      let result = rows.map((r) => {
        let findRoomById = roomRows?.find((room) => room.id === r.room_id);
        let findServiceById = serviceRows?.find((service) => service.id === r.service_id);
        let _r = {
          ...r,
          room: findRoomById,
          service: findServiceById
        }

        return _r;
      });

      return result;
    } finally {
      conn.release();
      }
  }
}