import { IJWTPayload } from "../authentication/authentication.interface";
import { IWorkRecordRow } from "../work_records/work_record.interface";

export interface IIncomeReportRow extends IWorkRecordRow {
  date_time: string;
  worker_name?: string;
  service_name?: string;
  price: number;
  total_price: number;
  total_salary: number;
  platform: string;
  commission_price: number;
  profit: number;
  discount_price: number;
}

export interface IIncomeReportQueryString {
  start_date: string;
  end_date: string;
}

export interface IIncomeReportService {
  getAll(query: IIncomeReportQueryString, options: { user: IJWTPayload } ): Promise<IIncomeReportRow[]>;
}
