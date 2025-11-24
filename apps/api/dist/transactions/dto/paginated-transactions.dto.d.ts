import { TransactionEntity } from '../entities/transaction.entity';
export declare class PaginationMetaDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class PaginatedTransactionsDto {
    data: TransactionEntity[];
    meta: PaginationMetaDto;
}
