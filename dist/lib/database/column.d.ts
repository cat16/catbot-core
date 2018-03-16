export interface ColumnOptions {
    name: string;
    value: any;
}
export declare class Column {
    name: string;
    value: any;
    constructor(options: ColumnOptions);
}
export interface ColumnInfoOptions {
    name: string;
    type: string;
    unique?: boolean;
}
export declare class ColumnInfo {
    name: string;
    type: string;
    unique: boolean;
    constructor(options: ColumnInfoOptions);
}
