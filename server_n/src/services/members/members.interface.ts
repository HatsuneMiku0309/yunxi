import { PoolClient } from "pg";
import { IJWTPayload } from "../authentication/authentication.interface";

export interface IMemberRow {
  id: string;
  name: string;
  phone: string;
  price: number;
  is_first: boolean;
  first_discount: number;
  discount: number;
  create_time: Date;
  update_time?: Date;
}

export interface IMemberQueryString {
  q: string;
}

export interface IMemberPayMoneyPayload {
  price: number;
}

export interface IMemberRechargeCardPayload {
  price: number;
  is_first: boolean;
}

export interface IMemberCreatePayload {
  name: string;
  phone: string;
  price: number;
}

export interface IMembersService {
  getAll(query: IMemberQueryString, options: { user: IJWTPayload } ): Promise<IMemberRow[]>;
  payMoney(id: string, body: IMemberPayMoneyPayload): Promise<{ id: string }>;
  dbPayMoney(conn: PoolClient, id: string, body: IMemberPayMoneyPayload): Promise<IMemberRow>;
  payAll(id: string): Promise<{ id: string }>;
  dbPayAll(conn: PoolClient, id: string): Promise<IMemberRow>;
  rechargeCard(id: string, body: IMemberPayMoneyPayload): Promise<{id: string}>;
  create(body: IMemberCreatePayload): Promise<{ id: string }>;
  modify(id: string, body: IMemberRow): Promise<{ id: string }>;
  calcMemberDiscount(row: IMemberRow, price: number): number;
}
