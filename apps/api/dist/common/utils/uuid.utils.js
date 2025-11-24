"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUuidV7 = generateUuidV7;
exports.generateUuidV4 = generateUuidV4;
exports.generateUuidV7Precise = generateUuidV7Precise;
const uuid_1 = require("uuid");
function generateUuidV7() {
    return (0, uuid_1.v7)();
}
function generateUuidV4() {
    return (0, uuid_1.v4)();
}
function generateUuidV7Precise() {
    return (0, uuid_1.v7)();
}
//# sourceMappingURL=uuid.utils.js.map