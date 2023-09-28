import { DatabaseProps, FriendsData, ProfileData, UserData } from "../../src/types/database";
import { getDisplayName } from "./adminUtils";

export const transformUserData = async (userData: UserData, userId: string):Promise<UserData> => {
  // Extracting existing properties to construct the new structure
  const role = userData.role ?? null;
  const last_online = userData.last_online ?? null;
  const beta_key_id = userData.beta_key_id ?? null;
  let username:string = "";
  try {
    let newUsername = await getDisplayName(userId);
    if (newUsername) {
      username = newUsername;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }

  // Placeholder values for new structure. You may want to modify these.
  const profile: ProfileData = {
      display_name: username,
      photo_url: ""
  };
  const friends: FriendsData = {};

  return {
      profile,
      friends,
      role,
      last_online,
      beta_key_id
  };
};
