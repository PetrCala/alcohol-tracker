import {UserId} from './DatabaseCommon';

type BetaKeyId = number;

type BetaKey = {
  // beta feature
  key: string;
  in_usage: boolean;
  user_id?: UserId;
};

type BetaKeyList = Record<BetaKeyId, BetaKey>;

export default BetaKey;
export type {BetaKeyList, BetaKeyId};
