type UserSearchResult = string;

type UserSearchResults = UserSearchResult[];

type SearchWindowRef = {
  focus: () => void;
};

type UserIdToNicknameMapping = {
  [userId: string]: string;
};

export type {
  UserSearchResults,
  UserSearchResult,
  SearchWindowRef,
  UserIdToNicknameMapping,
};
