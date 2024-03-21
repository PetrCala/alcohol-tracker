import {FetchDataKeys} from '@hooks/useFetchData/types';

type RefetchDatabaseData = (keys?: FetchDataKeys) => Promise<void>;

export type {RefetchDatabaseData};
