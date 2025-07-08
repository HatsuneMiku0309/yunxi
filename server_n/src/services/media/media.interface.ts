import { PoolClient } from "pg";
import { ICotnext } from "../utils.interface";

export interface IMediaRow {
  id: number;
  filepath: string;
  new_filename: string;
  original_filename: string;
  mimetype: string;
  size: number;
  create_time: Date;
  update_time: Date;
  extension: string;
}

export interface IMediaService {
  upload(ctx: ICotnext): Promise<IMediaRow[]>;
  removeFileById(id: string): Promise<{ id: string }>;
  removeFilesByIds(body: { ids: string[] }): Promise<{ ids: string[] }>;
  dbRemoveFilesByIds(conn: PoolClient, body: { ids: string[] }): Promise<{ ids: string[] }>;
}