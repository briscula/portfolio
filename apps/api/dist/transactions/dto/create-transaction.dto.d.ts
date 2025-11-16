import { $Enums } from '@repo/database';
export declare class CreateTransactionDto {
    portfolioId?: string;
    stockSymbol: string;
    quantity: number;
    price: number;
    commission?: number;
    currencyCode?: string;
    reference?: string;
    cost: number;
    netCost: number;
    tax?: number;
    taxPercentage?: number;
    date?: Date;
    notes?: string;
    type: $Enums.TransactionType;
}
