export type UserSearchResult = string;

export type UserSearchResults = UserSearchResult[];

export type SearchWindowRef = {
  focus: () => void;
};

export type UserIdToNicknameMapping = {
  [userId: string]: string;
};
