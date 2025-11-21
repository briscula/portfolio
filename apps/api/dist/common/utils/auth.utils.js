"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUtils = void 0;
const common_1 = require("@nestjs/common");
class AuthUtils {
    static async getUserIdFromToken(req, usersService) {
        if (req.user?.userId) {
            return req.user.userId;
        }
        const localUserId = req.user?.sub;
        if (localUserId) {
            return localUserId;
        }
        throw new common_1.UnauthorizedException('No user ID found in token');
    }
}
exports.AuthUtils = AuthUtils;
//# sourceMappingURL=auth.utils.js.map