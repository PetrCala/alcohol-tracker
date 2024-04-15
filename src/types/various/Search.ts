type UserSearchResult = string;

type UserSearchResults = UserSearchResult[];

type SearchWindowRef = {
  focus: () => void;
};

type UserIdToNicknameMapping = Record<string, string>;

export type {
  UserSearchResults,
  UserSearchResult,
  SearchWindowRef,
  UserIdToNicknameMapping,
};
