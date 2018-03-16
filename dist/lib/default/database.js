"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    bot: {
        name: 'bot',
        key: { name: 'key', type: 'BLOB' },
        cols: {
            value: { name: 'value', type: 'BLOB' }
        }
    },
    users: {
        name: 'users',
        key: { name: 'id', type: 'TEXT' },
        cols: {
            permTags: { name: 'permTags', type: 'TEXT' },
            admin: { name: 'admin', type: 'INTEGER' }
        }
    },
    commands: {
        name: 'commands',
        key: { name: 'name', type: 'TEXT' },
        cols: {
            permissions: { name: 'permissions', type: 'TEXT' },
            defaultPermission: { name: 'defaultPermission', type: 'INTEGER' },
            permMode: { name: 'permMode', type: 'TEXT' }
        }
    }
};
