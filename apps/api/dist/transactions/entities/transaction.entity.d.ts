import { $Enums, Transaction } from '@repo/database';
export declare class TransactionEntity implements Transaction {
    id: number;
    portfolioId: string;
    stockSymbol: string;
    type: $Enums.TransactionType;
    quantity: number;
    price: number;
    commission: number;
    currencyCode: string;
    notes: string | null;
    amount: number;
    totalAmount: number;
    tax: number;
    taxPercentage: number;
    reference: string | null;
    createdAt: Date;
    updatedAt: Date;
}
