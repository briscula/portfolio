import { UsersService } from '../users/users.service';
declare const Auth0JwtStrategy_base: new (...args: any) => any;
export declare class Auth0JwtStrategy extends Auth0JwtStrategy_base {
    private usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    validate(payload: any): Promise<any>;
}
export {};
