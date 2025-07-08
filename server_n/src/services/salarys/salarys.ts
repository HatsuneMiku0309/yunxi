import { IPgDb } from "../../db.interface";
import { ISalaryQueryString, ISalarysService, ISalaryRow } from "./salarys.interface";
import * as _ from 'lodash';
import { EWorkRecordStatus, IWorkRecordRow } from "../work_records/work_record.interface";
import { IJWTPayload } from "../authentication/authentication.interface";
import * as dayjs from 'dayjs';
import { IBaseSettingRow } from "../setting/setting.interface";
import { IWorkerRow } from "../workers/worker.interface";
import { Decimal } from 'decimal.js';

export class SalaryService implements ISalarysService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async getAll(query: ISalaryQueryString, options: { user: IJWTPayload }): Promise<ISalaryRow[]> {
    const { start_date, end_date } = query;
    const { user } = options;
    const conn = await this._pgDb.getPool().connect();
    try {
      if (!dayjs(start_date, 'YYYY-MM-DD HH:mm', true).isValid()) {
        throw new Error('开始时间格式错误');
      }
      if (!dayjs(end_date, 'YYYY-MM-DD HH:mm', true).isValid()) {
        throw new Error('结束时间格式错误');
      }
      const startDate = dayjs(start_date).format('YYYY-MM-DD HH:mm');
      const endDate = dayjs(end_date).format('YYYY-MM-DD HH:mm');
      const { rows: userRows } = await conn.query('SELECT * FROM users WHERE id = $1', [user.id]);
      const userRow = userRows[0];
      const whereSql = ['pay_time BETWEEN $1 AND $2', 'status = $3'];
      const params = [startDate, endDate, EWorkRecordStatus.finish];
      if (!userRow.is_admin) {
        if (userRow.worker_id) {
          params.push(userRow.worker_id);
          whereSql.push('worker_id = $4');
        } else {
          whereSql.push('1 = 2');
        }
      }
      const sql = `SELECT * FROM work_records WHERE ${whereSql.join(' AND ')}`;
      const { rows } = await conn.query<IWorkRecordRow>(sql, params);
      const workerIds = _.uniq(_.reduce(rows, (_r, v) => {
        if (v.worker_id) {
          _r.push(v.worker_id);
        }
        return _r;
      }, <number[]>[]));
      const { rows: workerRows } = workerIds.length ? await conn.query<IWorkerRow>(`SELECT * FROM workers WHERE id in (${workerIds.map((w, index) => `$${index + 1}`).join(', ')})`, workerIds) : { rows: [] };
      const serviceIds = _.uniq(_.reduce(rows, (_r, v) => {
        if (v.service_id) {
          _r.push(v.service_id);
        }
        return _r;
      }, <number[]>[]));
      const { rows: serviceRows } = serviceIds.length ? await conn.query<IWorkerRow>(`SELECT * FROM services WHERE id in (${serviceIds.map((w, index) => `$${index + 1}`).join(', ')})`, serviceIds) : { rows: [] };
      const { rows: baseSettingRows } = await conn.query<IBaseSettingRow>('SELECT * FROM base_settings');
      const profitSharing = _.find(baseSettingRows, (r) => r.name === 'profitSharing') || { name: 'profitSharing', value: 0 };
      const assignPrice = _.find(baseSettingRows, (r) => r.name === 'assignPrice') || { name: 'assignPrice', value: 0 };
      const increasePrice = _.find(baseSettingRows, (r) => r.name === 'increasePrice') || { name: 'increasePrice', value: 0 };
      const result = _.map(rows, (r) => {
        let _r = <ISalaryRow> {
          ...r,
          price: r.service_pay_salary_price,
        };
        const worker = workerRows.find((w) => w.id === _r.worker_id);
        const service = serviceRows.find((s) => s.id === _r.service_id);
        _r.date_time = dayjs(_r.pay_time).subtract(11, 'hour').format('YYYY/MM/DD');
        _r.worker_name = worker ? `${worker?.name}(${worker.no})` : '';
        _r.service_name = service ? service.name : '';
        _r.total_price = new Decimal(_r.price).plus(_r.extend_price || '0').toNumber();
        _r.assignPrice = _r.addition === 'assign' ? assignPrice.value : 0;
        _r.increasePrice = _r.addition === 'increase' ? increasePrice.value : 0;
        _r.salary = new Decimal(_r.total_price).mul(new Decimal(profitSharing.value).div(100)).toNumber();
        _r.total_salary = new Decimal(_r.salary).plus(_r.assignPrice).plus(_r.increasePrice).plus(_r.bonus_price || '0').toNumber();

        return _r;
      });

      return result;
    } finally {
      conn.release();
    }
  }
  
}