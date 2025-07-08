import * as path from 'path';
import { IPgDb } from "../../db.interface";
import * as fs from 'fs';
import { ICotnext } from '../utils.interface';
import { File, FileJSON } from 'formidable';
import { IMediaRow } from './media.interface';
import { PoolClient } from 'pg';

export class MediaService {
  private readonly _pgDb: IPgDb;
  readonly uploadDir = './uploads';
  constructor(pgDb: IPgDb) {
    this._pgDb = pgDb;
    this._checkDir(this.uploadDir);
  }

  private _checkDir(pathDir: string) {
    if (!fs.existsSync(path.resolve(pathDir))) {
      fs.mkdirSync(pathDir);
    }
  }

  private async _uploadFile(dir: string, files: File[]): Promise<IMediaRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      const createFiles = files.map((file) => {
        const splitFilename = file.originalFilename!.split('.');
        const extension = splitFilename.length > 1 ? splitFilename.pop() : '';
        return {
          filepath: path.join(this.uploadDir, dir),
          new_filename: file.newFilename,
          original_filename: file.originalFilename,
          mimetype: file.mimetype,
          size: file.size,
          extension: extension
        };
      });
      const { values, valuesSql, fieldSql } = this._pgDb.grantInsertBatchSql(createFiles);
      const sql = `INSERT INTO media ${fieldSql} VALUES ${valuesSql} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, values);
      await this._pgDb.setCommit(conn);

      const ids = rows.map((row) => row.id);
      const whereSql = ids.map((id, index) => `$${index + 1}`);      
      const { rows: mediaRow } = await conn.query<IMediaRow>(`SELECT * FROM media WHERE id in (${whereSql.join(', ')})`, ids);

      return mediaRow;
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }

  private _mvFile(dir: string, files: File[]) {
    try {
      this._checkDir(path.join(this.uploadDir, dir));
      files.forEach((file) => {
        fs.cpSync(path.join(this.uploadDir, file.newFilename), path.join(this.uploadDir, dir, file.newFilename));
        fs.rmSync(path.join(this.uploadDir, file.newFilename));
      })
    } catch (err) {
      throw err;
    }
  }

  async upload(ctx: ICotnext): Promise<IMediaRow[]> {
    const { dir = '' } = ctx.request.body;
    let mediaRows: IMediaRow[] = [];
    let _err = null;
    const files = ctx.request.files;
    if (files !== undefined) {
      for (let filename in files) {
        let file = files[filename];
        try {
          if ('length' in file) {
            this._mvFile(dir, file);
            mediaRows = await this._uploadFile(dir, file);
          } else {
            this._mvFile(dir, [file]);
            mediaRows = await this._uploadFile(dir, [file]);
          }
        } catch (err) {
          _err = err;
          const failFile = 'length' in file ? file : [file];
          this._failUploadDelFiles(path.join(this.uploadDir, dir), failFile);
          break;
        }
      }
    }
    if (_err) {
      throw _err;
    }

    return mediaRows;
  }

  private _failUploadDelFiles(dir: string, files: File[]) {
    files.forEach((file) => {
      try {
        fs.rmSync(path.join(dir, file.newFilename));
      } catch (err) {
        console.error(err);
      }
    });
  }

  async removeFileById(id: string) {
    await this.removeFilesByIds({ ids: [id] });

    return {
      id: id
    };
  }

  async dbRemoveFilesByIds(conn: PoolClient, body: { ids: string[] }) {
    const whereSql = body.ids.map((id, index) => `$${index + 1}`);
    const { rows } = await conn.query<IMediaRow>(`select * from media where id in (${whereSql.join(', ')})`, body.ids);
    const files = rows.map((row) => {
      const file: File = {
        size: row.size,
        filepath: row.filepath,
        originalFilename: row.original_filename,
        newFilename: row.new_filename,
        mimetype: row.mimetype,
        hashAlgorithm: false,
        toJSON: () => { return <FileJSON> {}; }
      };

      return file;
    });
    files.forEach((file) => {
      try {
        fs.rmSync(path.join(file.filepath, file.newFilename));
      } catch (err) {
        console.error(err);
      }
    });
    await conn.query(`delete from media where id in (${whereSql.join(', ')})`, body.ids);

    return body;
  }

  async removeFilesByIds(body: { ids: string[] }) {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      const result = await this.dbRemoveFilesByIds(conn, body);
      await this._pgDb.setCommit(conn);

      return result
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }
}
