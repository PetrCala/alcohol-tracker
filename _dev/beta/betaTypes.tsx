export type BetaKeysData = {
    [key_id: string]: {
        key: string;
        in_usage: boolean;
        user_id?: string;
    },
};