export interface ISalaryRow {
    id: number;
    date_time: string;
    pay_time: string;
    worker_id: string;
    worker_name: string;
    service_id: string;
    service_name: string;
    price: number;
    extend_price: number;
    total_price: number;
    assignPrice: number;
    increasePrice: number;
    bonus_price: number;
    salary: number;
    total_salary: number;
}

export interface IIncomeReportRow {
    id: number;
    date_time: string;
    pay_time: string;
    worker_id: string;
    worker_name: string;
    service_id: string;
    service_name: string;
    price: number;
    extend_price: number;
    total_price: number;
    total_salary: number;
    platform: string;
    commission_price: number;
    profit: number;
    discount_price: number;
    member_id?: string;
}