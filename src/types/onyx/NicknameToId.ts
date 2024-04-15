import type {UserId} from './DatabaseCommon';

type Nickname = string;

type NicknameKey = string;

type NicknameToId = Record<UserId, Nickname>;

type NicknameToIdList = Record<NicknameKey, NicknameToId>;

export default NicknameToId;
export type {Nickname, NicknameKey, NicknameToIdList};
