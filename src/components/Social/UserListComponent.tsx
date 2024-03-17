import {UserList} from '@src/types/database/DatabaseCommon';
import React, {useState, useEffect} from 'react';

interface UserListProps {
  initialLoadSize: number;
}

/**
 * A component for lazy data loading and display of a list of users.
 * Utilizes the UserList object to store user data.
 *
 * @param initialLoadSize - The number of users to load initially.
 * @returns A component for lazy data loading and display of a list of users.
 */
const UserListComponent: React.FC<UserListProps> = ({initialLoadSize}) => {
  // Complete list of users fetched from the database
  const [fullUserList, setFullUserList] = useState<UserList>({});

  // Partial list of users for initial display and dynamic updates
  const [displayUserList, setDisplayUserList] = useState<UserList>({});

  // Fetch the complete list from the database on component mount
  useEffect(() => {
    async function fetchUsers() {
      const usersFromDB: UserList = await fetchUsersFromDatabase();
      setFullUserList(usersFromDB);
      // Initialize display list with a subset of users
      setDisplayUserList(
        Object.fromEntries(
          Object.entries(usersFromDB).slice(0, initialLoadSize),
        ),
      );
    }
    fetchUsers();
  }, [initialLoadSize]);

  // Function to add more users to the display list
  const loadMoreUsers = (additionalCount: number) => {
    const currentSize = Object.keys(displayUserList).length;
    const additionalUsers = Object.fromEntries(
      Object.entries(fullUserList).slice(
        currentSize,
        currentSize + additionalCount,
      ),
    );
    setDisplayUserList({...displayUserList, ...additionalUsers});
  };

  // Function to find a user in the full list and add them to the display list if not already present
  const findAndDisplayUser = (userName: string) => {
    if (fullUserList[userName] && !displayUserList[userName]) {
      setDisplayUserList({...displayUserList, [userName]: true});
    }
  };

  return (
    <div>
      {/* Render user list here */}
      <button onClick={() => loadMoreUsers(10)}>Load More</button>
    </div>
  );
};

export default UserListComponent;
