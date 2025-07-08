import { IJWTPayload } from "../authentication/authentication.interface";
import { IWorkRecordRow } from "../work_records/work_record.interface";

export interface ISalaryRow extends IWorkRecordRow {
  date_time: string;
  worker_name?: string;
  service_name?: string;
  price: number;
  total_price: number;
  assignPrice: number;
  increasePrice: number;
  salary: number;
  total_salary: number;
}

export interface ISalaryQueryString {
  start_date: string;
  end_date: string;
}

export interface ISalarysService {
  getAll(query: ISalaryQueryString, options: { user: IJWTPayload } ): Promise<ISalaryRow[]>;
}
