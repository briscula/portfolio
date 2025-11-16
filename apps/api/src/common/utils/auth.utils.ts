import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

export class AuthUtils {
  /**
   * Extracts and validates user ID from JWT token
   * @param req - Express request object containing user info from JWT
   * @param usersService - UsersService instance for database lookup
   * @returns Promise<string> - Validated user ID from database
   * @throws UnauthorizedException if user not found or token invalid
   */
  static async getUserIdFromToken(
    req: any,
    usersService: UsersService,
  ): Promise<string> {
    // For Auth0 tokens, the user ID is already resolved by the strategy
    if (req.user?.userId) {
      return req.user.userId;
    }

    // For local JWT tokens (email/password), extract from sub
    const localUserId = req.user?.sub;
    if (localUserId) {
      // For UUID user IDs, we can return the string directly
      return localUserId;
    }

    throw new UnauthorizedException('No user ID found in token');
  }
}
