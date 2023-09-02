import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { handleUserConnection } from "./connection";

type UserConnectionContextProps = {
    isOnline: boolean;
};

export const UserConnectionContext = createContext<UserConnectionContextProps | null>(null);


/** Fetch the useConnection context. If the context does not exist, throw an error.
 * 
 * @example { isOnline } = useUserConnection(); // Returns a boolean
 */
export const useUserConnection = (): UserConnectionContextProps => {
    const context = useContext(UserConnectionContext);
    if (!context) {
        throw new Error("useUserConnection must be used within a UserConnectionProvider");
    };
    return context;
};

type UserConnectionProviderProps = {
  children: ReactNode;
  db: any; // Replace with the actual type
  auth: any; // Replace with the actual type
}

/** Provide a user connection context to the application
 * 
 * Using a user connection listener, monitor the user connection status
 * and provide this information through a context provider.
 */
export const UserConnectionProvider: React.FC<UserConnectionProviderProps> = ({ 
    children, 
    db, 
    auth 
}) => {
    const [isOnline, setIsOnline] = useState(false);
  
    useEffect(() => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const unsubscribe = handleUserConnection(db, userId, setIsOnline);
        return () => unsubscribe();
      }
    }, [db, auth]);
  
    const value = {
      isOnline,
    };
  
    return (
      <UserConnectionContext.Provider value={value}>
        {children}
      </UserConnectionContext.Provider>
    );
};