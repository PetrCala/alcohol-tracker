type UserSearchResult = string;

type UserSearchResults = UserSearchResult[];

type SearchWindowRef = {
  focus: () => void;
};

type UserIDToNicknameMapping = Record<string, string>;

export type {
  UserSearchResults,
  UserSearchResult,
  SearchWindowRef,
  UserIDToNicknameMapping,
};
