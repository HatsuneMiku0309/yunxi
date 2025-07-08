import { IPgDb } from "../../db.interface";
import { IServicePayRow, IServicePayService } from "./service.interface";
import * as _ from 'lodash';

export class ServicePayService implements IServicePayService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async getAll(): Promise<IServicePayRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query<IServicePayRow>('SELECT * FROM service_pays ORDER BY id');
      const _rows = _.map(rows, (r) => {
        if (!r.is_write)
          r.platform += `【${r.price}】`;

        return r;
      });

      return _rows;
    } finally {
      conn.release();
      }
  }

  /**
   * 只找service是啟用的service_pays
   * 
   * @param serviceID 
   * @returns 
   */
  async getByServiceId(serviceID: string): Promise<IServicePayRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query<IServicePayRow>(`
        SELECT sp.* FROM service_pays sp WHERE sp.service_id = $1 ORDER BY sp.id
        `, [serviceID]);
      const _rows = _.map(rows, (r) => {
        if (!r.is_write)
          r.platform += `【${r.price}】`;

        return r;
      });

      return _rows;
    } finally {
      conn.release();
    }
  }
}