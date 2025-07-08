import { PoolClient } from "pg";
import { IPgDb } from "../../db.interface";
import { ISettingService, IBaseSettingRow, IPlatformRow, ISettingPayload } from "./setting.interface";
import * as _ from 'lodash';

export class SettingService implements ISettingService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }
  async getAll(): Promise<{ base_settings: IBaseSettingRow[]; platforms: IPlatformRow[]; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows: baseSettingRows } = await conn.query('SELECT * FROM base_settings') ;
      const { rows: platformRows } = await conn.query('SELECT * FROM platforms') ;

      return {
        base_settings: baseSettingRows,
        platforms: platformRows
      };
    } finally {
      conn.release();
    }
  }

  private async _updateBaseSetting(conn: PoolClient, baseSettins: IBaseSettingRow[]): Promise<void> {
    for (let i in baseSettins) {
      const baseSettin = baseSettins[i];
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(baseSettin, ['id', 'update_time']);
      const sql = `UPDATE base_settings SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} RETURNING id`;
      await conn.query<{ id: number }>(sql, [...sets, new Date(), baseSettin.id]);
    }
  }

  private async _updatePlatform(conn: PoolClient, platforms: IPlatformRow[]): Promise<void> {
    for (let i in platforms) {
      const platform = platforms[i];
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(platform, ['id', 'update_time']);
      const sql = `UPDATE platforms SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} RETURNING id`;
      await conn.query<{ id: number }>(sql, [...sets, new Date(), platform.id]);
    }
  }

  async update(body: ISettingPayload): Promise<void> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._updateBaseSetting(conn, body.base_settings);
      await this._updatePlatform(conn, body.platforms);

      return void 0;
    } finally {
      conn.release();
    }
  }

  
}