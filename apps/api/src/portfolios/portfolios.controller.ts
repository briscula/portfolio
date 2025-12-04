import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { UnifiedAuthGuard } from '../auth/unified-auth.guard';
import { UsersService } from '../users/users.service';
import { AuthUtils } from '../common/utils/auth.utils';
import { PositionsService } from '../positions/positions.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { DividendAnalyticsService } from '../dividend-analytics/dividend-analytics.service';
import { DividendAnalyticsQueryDto } from '../dividend-analytics/dto/dividend-analytics-query.dto';
import { DividendMonthlyChartResponseDto } from '../dividend-analytics/dto/dividend-monthly-chart.dto';

@Controller('portfolios')
@ApiTags('portfolios')
@UseGuards(UnifiedAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PortfoliosController {
  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly usersService: UsersService,
    private readonly positionsService: PositionsService,
    private readonly transactionsService: TransactionsService,
    private readonly dividendAnalyticsService: DividendAnalyticsService,
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'Portfolio created successfully' })
  @ApiOperation({
    summary: 'Create a new portfolio',
    description: 'Creates a new portfolio for the authenticated user',
  })
  async create(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Request() req: any,
  ) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    return this.portfoliosService.create(createPortfolioDto, userId);
  }

  @Get()
  @ApiOkResponse({
    description: 'Returns all portfolios for the authenticated user',
  })
  @ApiOperation({
    summary: 'Get all portfolios',
    description: 'Returns all portfolios owned by the authenticated user',
  })
  async findAll(@Request() req: any) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    return this.portfoliosService.findAll(userId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns a specific portfolio' })
  @ApiOperation({
    summary: 'Get portfolio by ID',
    description: 'Returns a specific portfolio owned by the authenticated user',
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    return this.portfoliosService.findOne(id, userId);
  }

  @Get(':id/summary')
  @ApiOkResponse({ description: 'Returns portfolio summary with aggregated metrics' })
  @ApiOperation({
    summary: 'Get portfolio summary',
    description:
      'Returns aggregated portfolio metrics including total value, cost, gain, and position count',
  })
  async getPortfolioSummary(
    @Request() req: any,
    @Param('id') portfolioId: string,
  ) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    return this.positionsService.getPortfolioSummary(userId, portfolioId);
  }

  @Get(':id/positions')
  @ApiOkResponse({ description: 'Returns positions for a specific portfolio' })
  @ApiOperation({
    summary: 'Get portfolio positions',
    description:
      'Returns positions for a specific portfolio with pagination and sorting support',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 50)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description:
      'Sort field: portfolioPercentage, totalCost, totalDividends, currentQuantity, stockSymbol, companyName, sector, lastTransactionDate (default: portfolioPercentage)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order: asc or desc (default: desc)',
  })
  async getPortfolioPositions(
    @Request() req: any,
    @Param('id') portfolioId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    console.log(
      'Controller received portfolio ID:',
      portfolioId,
      'Type:',
      typeof portfolioId,
    );
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const sortField = sortBy || 'portfolioPercentage';
    const order = sortOrder || 'desc';

    // Get positions for the specific portfolio
    const positions = await this.positionsService.getPortfolioPositions(
      userId,
      portfolioId,
      pageNum,
      limitNum,
      sortField,
      order,
    );

    return {
      data: positions,
      portfolioId: portfolioId,
      sort: {
        sortBy: sortField,
        sortOrder: order,
      },
    };
  }

  @Get(':id/transactions')
  @ApiOkResponse({
    description: 'Returns transactions for a specific portfolio',
  })
  @ApiOperation({
    summary: 'Get portfolio transactions',
    description:
      'Returns transactions for a specific portfolio with pagination support',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 50)',
  })
  async getPortfolioTransactions(
    @Request() req: any,
    @Param('id') portfolioId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    // Get both transactions and pagination metadata
    const [transactions, pagination] = await Promise.all([
      this.transactionsService.findByPortfolio(
        userId,
        portfolioId,
        pageNum,
        limitNum,
      ),
      this.transactionsService.getPortfolioTransactionsPagination(
        userId,
        portfolioId,
        pageNum,
        limitNum,
      ),
    ]);

    return {
      data: transactions,
      portfolioId: portfolioId,
      pagination,
    };
  }

  @Post(':id/transactions')
  @ApiCreatedResponse({ description: 'Transaction created successfully' })
  @ApiOperation({
    summary: 'Create transaction in portfolio',
    description: 'Creates a new transaction in the specified portfolio',
  })
  async createPortfolioTransaction(
    @Request() req: any,
    @Param('id') portfolioId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);

    // Override the portfolioId in the DTO to match the URL parameter
    const transactionData = {
      ...createTransactionDto,
      portfolioId: portfolioId,
    };

    const transaction = await this.transactionsService.create(
      transactionData,
      userId,
    );

    return {
      data: transaction,
      portfolioId: portfolioId,
    };
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Portfolio updated successfully' })
  @ApiOperation({
    summary: 'Update portfolio',
    description: 'Updates a specific portfolio owned by the authenticated user',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Request() req: any,
  ) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    return this.portfoliosService.update(id, updatePortfolioDto, userId);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Portfolio deleted successfully' })
  @ApiOperation({
    summary: 'Delete portfolio',
    description: 'Deletes a specific portfolio owned by the authenticated user',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    return this.portfoliosService.remove(id, userId);
  }

  @Get(':id/dividends/summary')
  @ApiOkResponse({
    description: 'Dividend summary retrieved successfully',
  })
  @ApiOperation({
    summary: 'Get dividend summary for portfolio',
    description:
      'Returns aggregated dividend metrics including total dividends, yield, and average monthly dividends',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    description: 'Period for calculation: last12Months or allTime (default: last12Months)',
  })
  async getPortfolioDividendSummary(
    @Param('id') portfolioId: string,
    @Query('period') period?: 'last12Months' | 'allTime',
    @Request() req?: any,
  ) {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);
    return this.dividendAnalyticsService.getDividendSummary(
      userId,
      portfolioId,
      period || 'last12Months',
    );
  }

  @Get(':id/dividends/monthly')
  @ApiOkResponse({
    description: 'Monthly dividend data retrieved successfully',
  })
  @ApiOperation({
    summary: 'Get monthly dividend data for portfolio',
    description:
      'Returns monthly dividend data optimized for charting for a specific portfolio',
  })
  async getPortfolioMonthlyDividends(
    @Param('id') portfolioId: string,
    @Query() query: DividendAnalyticsQueryDto,
    @Request() req: any,
  ): Promise<DividendMonthlyChartResponseDto> {
    const userId = await AuthUtils.getUserIdFromToken(req, this.usersService);

    // Override the portfolioId in the query to use the URL parameter
    const portfolioQuery = {
      ...query,
      portfolioId: portfolioId,
    };

    return this.dividendAnalyticsService.getMonthlyDividendOverview(
      userId,
      portfolioQuery,
    );
  }
}
