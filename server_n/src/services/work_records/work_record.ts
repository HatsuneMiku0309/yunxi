import { PoolClient } from "pg";
import { IPgDb } from "../../db.interface";
import { EWorkRecordServiceStatus, EWorkRecordStatus, IWorkRecordClockInPayload, IWorkRecordPayActionPayload, IWorkRecordRow, IWorkRecordService, IWorkRecordCreateOrUpdatePayload } from "./work_record.interface";
import * as _ from 'lodash';
import { ERoomStatus, IRoomRow } from "../rooms/room.interface";
import { IJWTPayload } from "../authentication/authentication.interface";
import { IUserRow } from "../user/user.interface";
import { IServiceRow } from "../services/service.interface";
import dayjs = require("dayjs");
import { EWorkerStatus } from "../workers/worker.interface";
import { Utils } from "../utils";
import { IMembersService } from "../members/members.interface";

export class WorkerRecordService implements IWorkRecordService {
  private readonly _pgDb: IPgDb;
  private readonly _utils: Utils;
  constructor(pgDB: IPgDb, utils: Utils) {
      this._pgDb = pgDB;
      this._utils = utils
  }

  private async _selectWorkRecordToClockIn (conn: PoolClient, body: IWorkRecordClockInPayload) {
    const { rows } = await conn.query<IWorkRecordRow>('SELECT * FROM work_records WHERE id = $1 FOR UPDATE', [body.work_record_id]);
    const row = rows[0];
    if ([EWorkRecordStatus.finish, EWorkRecordStatus.cancel].includes(row.status)) {
      throw new Error('该上钟记录已经完成或取消');
    }
    if (row.service_status !== EWorkRecordServiceStatus.idle) {
      throw new Error('该上钟记录已经服务或完成');
    }
    const { rows: serviceRows } = await conn.query<IServiceRow>('SELECT * FROM services WHERE id = $1 FOR UPDATE', [body.service_id]);
    const serviceRow = serviceRows[0];
    const nowDate = new Date();
    const time = serviceRow.time;
    let _body = {
      ...body,
      service_status: EWorkRecordServiceStatus.run,
      start_time: dayjs(nowDate).add(1, 'minute').toDate(),
      end_time: dayjs(nowDate).add(1, 'minute').add(time, 'minute').toDate()
    };
    let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(_body, ['work_record_id']);
    const sql = `UPDATE work_records SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex}`;
    await conn.query<{ id: number }>(sql, [...sets, new Date(), row.id]);

    return {
      id: row.id
    }
  }

  private async _clockIn(conn: PoolClient, body: IWorkRecordClockInPayload) {
    const { rows: serviceRows } = await conn.query<IServiceRow>('SELECT * FROM services WHERE id = $1 FOR UPDATE', [body.service_id]);
    const serviceRow = serviceRows[0];
    const nowDate = new Date();
    const time = serviceRow.time;
    let _body = {
      ...body,
      service_status: EWorkRecordServiceStatus.run,
      status: EWorkRecordStatus.unpay,
      start_time: dayjs(nowDate).add(1, 'minute').toDate(),
      end_time: dayjs(nowDate).add(1, 'minute').add(time, 'minute').toDate()
    };
    const { fieldSql, valuesSql, values } = this._pgDb.grantInsertSql(_body);
    const sql = `INSERT INTO work_records ${fieldSql} VALUES ${valuesSql} RETURNING id`;
    const { rows } = await conn.query<{ id: number }>(sql, values);
    const row = rows[0];

    return {
      id: row.id
    }
  }

  private async _setClockInDependencesStatus(conn: PoolClient, id: number, isClockIn = true) {
    const { rows } = await conn.query('SELECT * FROM work_records WHERE id = $1 FOR UPDATE', [id]);
    const row = rows[0];
    const worker_id = row.worker_id;
    const room_id = row.room_id;
    const service_id = row.service_id;
    if (worker_id && isClockIn) {
      let body = {
        status: EWorkerStatus.working,
        room_id: room_id,
        service_id: service_id,
        work_record_id: id
      };
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body);
      const workerSql = `UPDATE workers SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex}`;
      await conn.query<{ id: number }>(workerSql, [...sets, new Date(), worker_id]);
    }

    if (room_id) {
      await conn.query('UPDATE rooms SET status = $1, update_time = $2 WHERE id = $3', [ERoomStatus.using, new Date(), room_id]);
      let _body = {
        room_id,
        worker_id: isClockIn ? worker_id : null,
        service_id: isClockIn ? service_id : null,
        work_record_id: id
      };
      const { fieldSql, valuesSql, values } = this._pgDb.grantInsertSql(_body);
      const roomExtendsSql = `INSERT INTO room_extends ${fieldSql} VALUES ${valuesSql}`;
      await conn.query(roomExtendsSql, values);
    }
  }

  async clockIn(body: IWorkRecordClockInPayload): Promise<{ id: number }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      let result;
      if (body.work_record_id) {
        result = await this._selectWorkRecordToClockIn(conn, body);
      } else {
        result = await this._clockIn(conn, body);
      }
      await this._setClockInDependencesStatus(conn, result.id);
      await this._pgDb.setCommit(conn);

      return result;
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }

  private async _setClockOutDependencesStatus(conn: PoolClient, id: number, isClockOut = true) {
    const { rows } = await conn.query<IWorkRecordRow>('SELECT * FROM work_records WHERE id = $1 FOR UPDATE', [id]);
    const row = rows[0];
    const worker_id = row.worker_id;
    
    // 只有对应的work_record_id才会去修改worker状态（如果连续上两个钟，旧的钟不会改掉新钟的上钟状态）
    if (worker_id && isClockOut) {
      let body = {
        status: EWorkerStatus.idle,
        room_id: null,
        service_id: null,
        work_record_id: null
      };
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body);
      const workerSql = `UPDATE workers SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} AND work_record_id = $${++nextIndex}`;
      await conn.query<{ id: number }>(workerSql, [...sets, new Date(), worker_id, id]);
    }
    await conn.query('DELETE FROM room_extends WHERE work_record_id = $1', [id]);
  }

  async clockOut(id: string, options: { user: IJWTPayload }): Promise<{ id: string; }> {
    const { user } = options;
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      const { rows: userRows } = await conn.query('SELECT * FROM users WHERE id = $1', [user.id]);
      const userRow = userRows[0];
      
      const { rows } = await conn.query('SELECT * FROM work_records WHERE id = $1 FOR UPDATE', [id]);
      const row = rows[0];
      if (row.service_status !== EWorkRecordServiceStatus.run) {
        throw new Error('非执行状态，无法下钟');
      }
      if ([EWorkRecordStatus.finish, EWorkRecordStatus.cancel].includes(row.status)) {
        throw new Error('已经完成或取消付款');
      }

      if (!user.is_admin && (userRow.worker_id !== row.worker_id)) {
        throw new Error('不可下他人的钟！');
      }

      await conn.query(
        'UPDATE work_records SET service_status = $1, update_time = $2 WHERE id = $3',
        [EWorkRecordServiceStatus.finish, new Date(), id]
      );
      await this._setClockOutDependencesStatus(conn, row.id);
      await this._pgDb.setCommit(conn);

      return {
        id
      };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }

  private async _setPayDependencesStatus(conn: PoolClient, id: string) {
    const { rows } = await conn.query('SELECT * FROM work_records WHERE id = $1 FOR UPDATE', [id]);
    const row = rows[0];
    const worker_id = row.worker_id;
    const room_id = row.room_id;
    
    // 只有对应的work_record_id才会去修改worker状态（如果连续上两个钟，旧的钟不会改掉新钟的上钟状态）
    if (worker_id) {
      let body = {
        status: EWorkerStatus.idle,
        room_id: null,
        service_id: null,
        work_record_id: null
      };
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body);
      const workerSql = `UPDATE workers SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} AND work_record_id = $${++nextIndex}`;
      await conn.query<{ id: number }>(workerSql, [...sets, new Date(), worker_id, id]);
    }
    await conn.query('DELETE FROM room_extends WHERE work_record_id = $1', [id]);
    if (room_id) {
      const { rows: extendsRows } = await conn.query('SELECT * FROM room_extends WHERE room_id = $1 FOR UPDATE', [room_id]);
      // 因為付款完成後，如果該房間都沒客人，那就意味該房間空出！
      // 這裡也許也能轉為clean？
      if (!extendsRows.length) {
        await conn.query('UPDATE rooms SET status = $1, update_time = $2 WHERE id = $3', [ERoomStatus.idle, new Date(), room_id]);
      }
    }
  }

  private async _memberPay(id: string | undefined, price: number) {
    if (id) {
      const memberService = <IMembersService> this._utils.get('member');
      await memberService.payMoney(id, { price });
    }
  }

  async actionPay(id: string, body: IWorkRecordPayActionPayload): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      const { service_pay_id, service_id } = body;
      if (service_pay_id === undefined || service_pay_id === null || service_id === undefined || service_id === null) {
        throw new Error('缺少付款信息！');
      }
      const { rows: servicePayRows } = await conn.query('SELECT * FROM service_pays WHERE id = $1 AND service_id = $2 FOR UPDATE', [service_pay_id, service_id]);
      if (servicePayRows.length !== 1) {
        throw new Error('付款信息错误！');
      }
      const { rows } = await conn.query('SELECT * FROM work_records WHERE id = $1 FOR UPDATE', [id]);
      const row = rows[0];
      if ([EWorkRecordStatus.finish, EWorkRecordStatus.cancel].includes(row.status)) {
        throw new Error('已经完成或取消的服务记录不可再付款！');
      }

      const servicePayRow = servicePayRows[0];
      let _body = {
        ...body,
        member_id: body.member_id ? body.member_id : undefined,
        service_pay_platform: servicePayRow.platform,
        service_pay_price: servicePayRow.is_write ? body.other_pay_price : servicePayRow.price,
        service_pay_time: servicePayRow.time,
        service_pay_is_write: servicePayRow.is_write,
        service_pay_salary_price: servicePayRow.is_write ? body.other_pay_price : servicePayRow.salary_price,
        status: EWorkRecordStatus.finish,
        service_status: EWorkRecordServiceStatus.finish
      };

      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(_body);
      const sql = `UPDATE work_records SET
          ${setSql}, update_time = $${++nextIndex},
          pay_time = $${++nextIndex} 
        WHERE id = $${++nextIndex} RETURNING id`;
      const { rows: _rows } = await conn.query(sql, [ ...sets, new Date(), new Date(), id ]);
      await this._memberPay(_body.member_id, Number(_body.service_pay_price));
      await this._setPayDependencesStatus(conn, id);
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }

  async actionCancel(id: string): Promise<{ id: string }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query<IWorkRecordRow>('SELECT * FROM work_records WHERE id = $1 FOR UPDATE', [id]);
      const row = rows.length ? rows[0] : undefined;
      if (!row) {
        throw new Error(`找不到该服务记录【${id}】`);
      }
      // 已经完成付款最后步骤（非已付款），不可再取消。
      // 如要取消，应该至DB直接修改
      if ([EWorkRecordStatus.finish, EWorkRecordStatus.cancel].includes(row.status)) {
        throw new Error('已经完成或取消的服务记录不可再取消！');
      }

      const { rows: _updateRows } = await conn.query(
        'UPDATE work_records SET status = $2, pay_time = $3, update_time = $4 WHERE id = $1',
        [id, EWorkRecordStatus.cancel, new Date(), new Date()]
      );
      await this._setPayDependencesStatus(conn, id);

      return { 
        id
      };
    } finally {
      conn.release();
    }
  }

  async getAll(query: any, options: { user: IJWTPayload }): Promise<IWorkRecordRow[]> {
    const { service_status } = query;
    const { user } = options; 
    const conn = await this._pgDb.getPool().connect();
    try {
      const params: any[] = [EWorkRecordStatus.unpay, EWorkRecordStatus.payed];
      const whereSql = ['status in ($1, $2)'];
      if (user) {
        const { rows } = await conn.query<IUserRow>('SELECT * FROM users WHERE id = $1', [user.id]);
        const row = rows[0];
        if (!row.is_admin) {
          params.push(row.worker_id);
          whereSql.push(`(worker_id = $${params.length} OR worker_id is null)`);
        }
      }

      if (service_status) {
        params.push(service_status);
        whereSql.push(`service_status = $${params.length}`);
      }
      const sql = `SELECT * FROM work_records WHERE ${whereSql.join(' AND ')} ORDER BY id`;
      const { rows } = await conn.query<IWorkRecordRow>(sql, params);
      const roomIds = _.uniq(_.reduce(rows, (_r, v) => {
        if (v.room_id)
          _r.push(v.room_id);

        return _r;
      }, <number[]>[]));
      const whereRoomSql = _.map(roomIds, (v, index) => `$${index + 1}`);
      const { rows: roomRows } = roomIds.length ? await conn.query<IRoomRow>(`SELECT * FROM rooms where id in (${whereRoomSql.join(', ')})`, roomIds) : { rows: [] };
      
      const workerIds = _.uniq(_.reduce(rows, (_r, v) => {
        if (v.worker_id)
          _r.push(v.worker_id);

        return _r;
      }, <number[]>[]));
      const whereWorkerSql = _.map(workerIds, (v, index) => `$${index + 1}`);
      const { rows: workerRows } = workerIds.length ? await conn.query<IRoomRow>(`SELECT * FROM workers where id in (${whereWorkerSql.join(', ')})`, workerIds) : { rows: [] };

      const serviceIds = _.uniq(_.reduce(rows, (_r, v) => {
        if (v.service_id)
          _r.push(v.service_id);

        return _r;
      }, <number[]>[]));
      const whereServiceSql = _.map(serviceIds, (v, index) => `$${index + 1}`);
      const { rows: serviceRows } = serviceIds.length ? await conn.query<IRoomRow>(`SELECT * FROM services where id in (${whereServiceSql.join(', ')})`, serviceIds) : { rows: [] };

      let result = _.map(rows, (row) => {
        let findRoomById = _.find(roomRows, (r) => r.id === row.room_id);
        let findWorkerById = _.find(workerRows, (r) => r.id === row.worker_id);
        let findServiceById = _.find(serviceRows, (r) => r.id === row.service_id);
        let r = {
          ...row,
          room: findRoomById,
          worker: findWorkerById,
          service: findServiceById
        };

        return r;
      });
      
      return result;
    } finally {
      conn.release();
      }
  }

  async create(body: IWorkRecordCreateOrUpdatePayload): Promise<{ id: number }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      let _body = {
        ...body,
        addition: 'none',
        service_status: EWorkRecordServiceStatus.idle
      };
      const { fieldSql, valuesSql, values } = this._pgDb.grantInsertSql(_body);
      const sql = `INSERT INTO work_records ${fieldSql} VALUES ${valuesSql} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, values);
      const row = rows[0];
      this._setClockInDependencesStatus(conn, row.id, false);
      await this._pgDb.setCommit(conn);

      return {
        id: row.id
      };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }

  async update(id: string, body: IWorkRecordCreateOrUpdatePayload): Promise<{ id: number }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      const { rows } = await conn.query<IWorkRecordRow>('SELECT * FROM work_records WHERE id = $1 FOR UPDATE', [id]);
      const row = rows[0];
      let isClockInOut = row.service_status === EWorkRecordServiceStatus.run ? true : false;
      this._setClockOutDependencesStatus(conn, Number(id), isClockInOut);
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body);
      const sql = `UPDATE work_records SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} RETURNING id`;
      const { rows: updateRows } = await conn.query<{ id: number }>(sql, [...sets, new Date(), id]);
      const updateRow = updateRows[0];
      this._setClockInDependencesStatus(conn, updateRow.id, isClockInOut);
      await this._pgDb.setCommit(conn);

      return {
        id: updateRow.id
      };
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }
}