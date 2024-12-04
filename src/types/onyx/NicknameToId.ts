import type {UserID} from './OnyxCommon';

/**
 *
 */
type Nickname = string;

/**
 *
 */
type NicknameKey = string;

/**
 *
 */
type NicknameToId = Record<UserID, Nickname>;

/**
 *
 */
type NicknameToIdList = Record<NicknameKey, NicknameToId>;

export default NicknameToId;
export type {Nickname, NicknameKey, NicknameToIdList};
