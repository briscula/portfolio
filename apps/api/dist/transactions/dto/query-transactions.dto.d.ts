import { $Enums } from '@repo/database';
export declare class QueryTransactionsDto {
    portfolioId?: string[];
    type?: $Enums.TransactionType;
    symbol?: string;
    dateFrom?: string;
    dateTo?: string;
    limit: number;
    offset: number;
    sort?: string;
}
