import { UsersService } from '../../users/users.service';
export declare class AuthUtils {
    static getUserIdFromToken(req: any, usersService: UsersService): Promise<string>;
}
