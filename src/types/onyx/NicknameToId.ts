import type {UserID} from './OnyxCommon';

/** A user nickname */
type Nickname = string;

/** A key that holds a nickname to ID mapping */
type NicknameKey = string;

/** A list of mappings of user IDs to nicknames */
type NicknameToId = Record<UserID, Nickname>;

/** A list of mapping of nickname keys to nickname IDs */
type NicknameToIdList = Record<NicknameKey, NicknameToId>;

export default NicknameToId;
export type {Nickname, NicknameKey, NicknameToIdList};
