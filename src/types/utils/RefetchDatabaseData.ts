import {UserFetchDataKey} from '@hooks/useFetchData';

type RefetchDatabaseData = (keys?: UserFetchDataKey[]) => Promise<void>;

export type {RefetchDatabaseData};
