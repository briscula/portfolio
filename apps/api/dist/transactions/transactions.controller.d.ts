import { TransactionsService } from './transactions.service';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { PaginatedTransactionsDto } from './dto/paginated-transactions.dto';
import { UsersService } from '../users/users.service';
export declare class TransactionsController {
    private readonly transactionsService;
    private readonly usersService;
    constructor(transactionsService: TransactionsService, usersService: UsersService);
    findAll(queryDto: QueryTransactionsDto, req: any): Promise<PaginatedTransactionsDto>;
}
