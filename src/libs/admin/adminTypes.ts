import type {UserID} from '@src/types/onyx/OnyxCommon';

type DisplayName = string | undefined;
type IdToDisplayName = Record<UserID, DisplayName>;

export type {DisplayName, IdToDisplayName};
