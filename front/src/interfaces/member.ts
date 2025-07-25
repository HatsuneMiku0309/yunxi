export interface IMemberData {
    id: string;
    name: string;
    phone: string;
    price: string;
    is_first: boolean;
    first_discount: string;
    discount: string;
}

export enum EMemberAction {
    pay_money,
    recharge_card,
    create,
    modify
}