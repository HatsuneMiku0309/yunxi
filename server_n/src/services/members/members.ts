import { IPgDb } from "../../db.interface";
import { IMemberQueryString, IMembersService, IMemberRow, IMemberPayMoneyPayload, IMemberRechargeCardPayload, IMemberCreatePayload } from "./members.interface";
import * as _ from 'lodash';
import { IJWTPayload } from "../authentication/authentication.interface";
import { Decimal } from 'decimal.js';
import { v4 as uuid } from 'uuid';
import { PoolClient } from "pg";

interface IError extends Error {
  message: string;
  c_state?: string,
  data?: { [key: string]: any };
}

export class MemberService implements IMembersService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async getAll(query: IMemberQueryString, options: { user: IJWTPayload }): Promise<IMemberRow[]> {
    const { q } = query;
    const { user: _user } = options;
    const conn = await this._pgDb.getPool().connect();
    try {
      let params = [];
      let whereSql = [];
      let sql = 'select * from members';
      if (q !== null && q !== undefined) {
        whereSql.push(`name like $1 OR phone like $2`);
        params.push(...[`%${q}%`, `%${q}%`]);
      }
      if (whereSql.length) {
        sql += ` WHERE ${whereSql.join(' AND ')}`;
      }
      const { rows } = await conn.query<IMemberRow>(sql, params);

      return rows;
    } finally {
      conn.release();
    }
  }

  async create(body: IMemberCreatePayload): Promise<{ id: string; }> {
    const { name, phone, price } = body;
    const conn = await this._pgDb.getPool().connect();
    try {
      const [_price, first_discount] = this.checkRechargeCardPriceStep(Number(price), true);
      const id = uuid();
      const { rows } = await conn.query<{ id: string }>('insert into members (id, name, phone, price, first_discount, discount) values ($1, $2, $3, $4, $5, $6) RETURNING id', [id, name, phone, price, first_discount, 88]);
      const row = rows[0];

      return { id: row.id };
    } finally {
      conn.release();
    }
  }

  async modify(id: string, body: IMemberRow): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body, ['create_time', 'id', 'update_time']);
      await conn.query<{ id: string }>(`update members set ${setSql} where id = $${++nextIndex}`, [...sets, id]);

      return { id };
    } finally {
      conn.release();
    }
  }

  calcMemberDiscount(row: IMemberRow, price: number) {
    let finalPrice = price;
    if (row.is_first) {
      finalPrice = new Decimal(price).mul(new Decimal(row.first_discount).div(100)).toNumber();
    } else {
      finalPrice = new Decimal(price).mul(new Decimal(row.discount).div(100)).toNumber();
    }

    return finalPrice;
  }

  async dbPayMoney(conn: PoolClient, id: string, body: IMemberPayMoneyPayload): Promise<IMemberRow> {
    const { price } = body;
    const sql = 'select * from members where id = $1 FOR UPDATE';
    const { rows } = await conn.query<IMemberRow>(sql, [id]);
    const row = rows[0];
    const finalPrice = await this.calcMemberDiscount(row, price);
    if (row.price < finalPrice) {
      let err: IError = new Error(`会员卡余额: ${row.price}，不足以支付: ${finalPrice}。需另外支付: ${new Decimal(finalPrice).sub(row.price).toNumber()}`);
      const diffPrice = new Decimal(finalPrice).sub(row.price).toNumber();
      err.c_state = 'member_price';
      err.data = {
        price: row.price,
        finalPrice,
        diffPrice
      };

      throw err;
    }

    const memberPrice = new Decimal(row.price).sub(finalPrice).toNumber();
    const is_first = row.is_first ? false : row.is_first;
    await conn.query('update members set price = $1, is_first = $2, update_time = $3 where id = $4', [memberPrice, is_first, new Date(), id]);

    return row;
  }

  async payMoney(id: string, body: IMemberPayMoneyPayload): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await this.dbPayMoney(conn, id, body);
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);

      throw err;
    } finally {
      conn.release();
    }
  }

  async dbPayAll(conn: PoolClient, id: string): Promise<IMemberRow> {
    const sql = 'select * from members where id = $1 FOR UPDATE';
    const { rows } = await conn.query<IMemberRow>(sql, [id]);
    const row = rows[0];
    await conn.query('update members set price = 0, is_first = false, update_time = $1 where id = $2', [new Date(), id]);
    
    return row;
  }

  async payAll(id: string): Promise<{ id: string; }> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      await this.dbPayAll(conn, id);
      await this._pgDb.setCommit(conn);

      return { id };
    } catch (err) {
      await this._pgDb.setRollback(conn);

      throw err;
    } finally {
      conn.release();
    }
  }

  private checkRechargeCardPriceStep(price: number, is_first: boolean) {
    if (is_first) {
      if (price === 500) {
        return [500, 85];
      } else if (price === 1000) {
        return [1000, 75];
      } else if (price === 2000) {
        return [2000, 65];
      } else if (price === 3000) {
        return [3000, 50];
      }

      throw new Error(`充值金额错误，不可自定义充值金额: ${price}，只允许[500, 1000, 2000, 3000]面额。`);
    }

    return [price, undefined];
  }

  async rechargeCard(id: string, body: IMemberRechargeCardPayload): Promise<{ id: string; }> {
    const { price, is_first } = body;
    const [_price, first_discount] = this.checkRechargeCardPriceStep(Number(price), is_first);
    const conn = await this._pgDb.getPool().connect();
    let index = 3;
    let params: any[] = [_price, is_first];
    try {
      let sql = 'update members set price = price + $1, is_first = $2';
      if (first_discount) {
        params.push(first_discount);
        sql += `, first_discount = $${index}`;
        index++;
      }
      params.push(id);
      sql += ` where id = $${index}`;
      await conn.query(sql, params);

      return { id };
    } finally {
      conn.release();
    }
  }
}