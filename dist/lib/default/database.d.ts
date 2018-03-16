declare const _default: {
    bot: {
        name: string;
        key: {
            name: string;
            type: string;
        };
        cols: {
            value: {
                name: string;
                type: string;
            };
        };
    };
    users: {
        name: string;
        key: {
            name: string;
            type: string;
        };
        cols: {
            permTags: {
                name: string;
                type: string;
            };
            admin: {
                name: string;
                type: string;
            };
        };
    };
    commands: {
        name: string;
        key: {
            name: string;
            type: string;
        };
        cols: {
            permissions: {
                name: string;
                type: string;
            };
            defaultPermission: {
                name: string;
                type: string;
            };
            permMode: {
                name: string;
                type: string;
            };
        };
    };
};
export default _default;
