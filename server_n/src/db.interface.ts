import { Pool, Client, PoolClient } from 'pg';

export type RequiredKeys<T> = {
  [K in keyof T]-?: T[K] extends Required<T>[K] ? K : never;
}[keyof T];
export type RequiredProperties<T> = Pick<T, OptionalKeys<T>>;
export type OptionalKeys<T> = {
  [K in keyof T]-?: T[K] extends Required<T>[K] ? never : K;
}[keyof T];
export type OptionalProperties<T> = Pick<T, OptionalKeys<T>>;

export interface IPgDb {
  setTransaction(conn: PoolClient): Promise<void>;
  setCommit(conn: PoolClient): Promise<void>;
  setRollback(conn: PoolClient): Promise<void>;
  getPool(): Pool;
  getClient?(): Client;
  grantInsertSql<T extends object, U extends OptionalProperties<T>>(body: T, defaultValue?: U): { fields: string[], values: any[], fieldSql: string, valuesSql: string };
  grantInsertBatchSql<T extends Array<object>, U extends OptionalProperties<T[0]>>(body: T, defaultValue?: U): { fields: string[], values: any[][], fieldSql: string, valuesSql: string };
  grantUpdateSql<T extends object>(body: T, ignores?: (keyof T)[]): { sets: any[], setSql: string, nextIndex: number };
}