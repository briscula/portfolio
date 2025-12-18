import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Post,
  Body,
  Param, // Added
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { PaginatedTransactionsDto } from './dto/paginated-transactions.dto';
import { TransactionEntity } from './entities/transaction.entity';
import {
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiParam, // Added for Swagger documentation
} from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../auth/unified-auth.guard';
import { UsersService } from '../users/users.service';
import { AuthUtils } from '../common/utils/auth.utils';

@Controller('portfolios/:portfolioId/transactions') // Changed base path
@ApiTags('transactions')
@UseGuards(UnifiedAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiParam({ name: 'portfolioId', description: 'ID of the portfolio', type: 'string' }) // Added for Swagger
  @ApiCreatedResponse({ type: TransactionEntity })
  async create(
    @Param('portfolioId') portfolioId: string, // Extracted from path
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: any,
  ): Promise<TransactionEntity> {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    const createdTransaction = await this.transactionsService.create(
      createTransactionDto,
      userId,
      portfolioId, // Pass portfolioId from path
    );
    return createdTransaction;
  }

  @Get() // This GET endpoint will now be at /portfolios/:portfolioId/transactions
  @ApiOkResponse({ type: PaginatedTransactionsDto })
  @ApiOperation({
    summary: 'Get all transactions for a specific portfolio', // Updated summary
    description:
      'Returns paginated list of transactions for the authenticated user and specified portfolio with optional filtering',
  })
  @ApiParam({ name: 'portfolioId', description: 'ID of the portfolio', type: 'string' }) // Added for Swagger
  async findAll(@Param('portfolioId') portfolioId: string, @Query() queryDto: QueryTransactionsDto, @Request() req: any) { // portfolioId from path
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    // You might need to adjust findAll to filter by portfolioId from path
    // For now, let's assume queryDto.portfolioId is still used or this is implicitly filtered
    return this.transactionsService.findAll(queryDto, userId, portfolioId); // Pass portfolioId from path
  }

}
