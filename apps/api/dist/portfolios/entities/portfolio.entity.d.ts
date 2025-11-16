import { Portfolio } from '@repo/database';
import { CurrencyDto } from '../dto/currency.dto';
export declare class PortfolioEntity implements Portfolio {
    constructor(partial: Partial<PortfolioEntity>);
    id: string;
    userId: string;
    name: string;
    description: string;
    currencyCode: string;
    currency?: CurrencyDto;
    createdAt: Date;
    updatedAt: Date;
}
