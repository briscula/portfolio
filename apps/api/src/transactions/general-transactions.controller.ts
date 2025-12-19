import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { PaginatedTransactionsDto } from './dto/paginated-transactions.dto';
import {
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../auth/unified-auth.guard';
import { UsersService } from '../users/users.service';
import { AuthUtils } from '../common/utils/auth.utils';

/**
 * Controller for general transaction endpoints that work across all portfolios
 */
@Controller('transactions')
@ApiTags('transactions')
@UseGuards(UnifiedAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GeneralTransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOkResponse({ type: PaginatedTransactionsDto })
  @ApiOperation({
    summary: 'Get all transactions across all portfolios',
    description:
      'Returns paginated list of transactions for the authenticated user across all their portfolios with optional filtering. Use portfolioId query parameter to filter by specific portfolio.',
  })
  async findAll(@Query() queryDto: QueryTransactionsDto, @Request() req: any) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    // Pass null as portfolioId to get transactions from all portfolios
    return this.transactionsService.findAllAcrossPortfolios(queryDto, userId);
  }
}
