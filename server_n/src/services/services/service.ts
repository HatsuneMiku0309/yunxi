import { IPgDb } from "../../db.interface";
import { IServicePayRow, IServiceRow, IServiceService } from "./service.interface";
import * as _ from 'lodash';

export class ServiceService implements IServiceService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async getAll(): Promise<IServiceRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query<IServiceRow>('SELECT * FROM services WHERE enabled = true ORDER BY "order"');
      const serviceIds = _.map(rows, (row) => row.id);
      const whereSql = serviceIds.map((v, index) => `$${index + 1}`);
      const { rows: servicePayRows } = await conn.query<IServicePayRow>(`SELECT * FROM service_pays WHERE service_id in (${whereSql.join(', ')}) ORDER BY id`, serviceIds);
      const _servicePayRows = _.map(servicePayRows, (r) => {
        if (!r.is_write)
          r.platform += `【${r.price}】`;

        return r;
      });
      let result = _.map(rows, (row) => {
        let filterServicePayRows = _.filter(_servicePayRows, (servicePay) => servicePay.service_id === row.id);
        
        let _r = {
          ...row,
          service_pays: filterServicePayRows
        };

        return _r;
      });

      return result;
    } finally {
      conn.release();
      }
  }
}