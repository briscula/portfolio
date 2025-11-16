import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyDto } from './dto/currency.dto';

@Injectable()
export class PortfoliosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate UUID format (supports both v4 and v7)
   */
  private isValidUUID(uuid: string): boolean {
    // Basic UUID format check - 8-4-4-4-12 pattern
    if (!uuid || typeof uuid !== 'string') return false;
    const trimmed = uuid.trim();
    const parts = trimmed.split('-');
    return (
      parts.length === 5 &&
      parts[0].length === 8 &&
      parts[1].length === 4 &&
      parts[2].length === 4 &&
      parts[3].length === 4 &&
      parts[4].length === 12
    );
  }

  /**
   * Validate portfolio exists and belongs to user
   */
  private async validatePortfolio(
    userId: string,
    portfolioId: string,
  ): Promise<void> {
    // Temporarily disable UUID validation to test endpoint
    console.log(
      'Portfolio ID in portfolios service:',
      portfolioId,
      'Type:',
      typeof portfolioId,
    );
    // if (!this.isValidUUID(portfolioId)) {
    //   throw new BadRequestException('Invalid portfolio ID format. Expected UUID format.');
    // }

    const portfolio = await this.prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: userId,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found or access denied.');
    }
  }

  private transformCurrency(currency: any): CurrencyDto | undefined {
    if (!currency) return undefined;
    return {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
    };
  }

  create(createPortfolioDto: CreatePortfolioDto, userId: string) {
    const { name, description } = createPortfolioDto;

    return this.prisma.portfolio.create({
      data: {
        name,
        description,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId: userId },
      include: {
        currency: true,
      },
    });

    return portfolios.map((portfolio) => ({
      ...portfolio,
      currency: this.transformCurrency(portfolio.currency),
    }));
  }

  async findOne(portfolioId: string, userId: string) {
    // Validate portfolio first
    await this.validatePortfolio(userId, portfolioId);

    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId, userId: userId },
      include: {
        currency: true,
      },
    });

    return {
      ...portfolio,
      currency: this.transformCurrency(portfolio.currency),
    };
  }

  async update(
    portfolioId: string,
    updatePortfolioDto: UpdatePortfolioDto,
    userId: string,
  ) {
    // Validate portfolio first
    await this.validatePortfolio(userId, portfolioId);

    return this.prisma.portfolio.update({
      where: {
        id: portfolioId,
        userId: userId,
      },
      data: updatePortfolioDto,
    });
  }

  async remove(portfolioId: string, userId: string) {
    // Validate portfolio first
    await this.validatePortfolio(userId, portfolioId);

    return this.prisma.portfolio.delete({
      where: { id: portfolioId, userId: userId },
    });
  }
}
