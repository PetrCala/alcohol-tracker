import { ReactNode } from "react";
import DatabaseContext from "./DatabaseContext";
import { UserConnectionProvider } from "./UserConnectionContext";
import { VersionManagementProvider } from "./VersionContext";
import { Database } from "firebase/database";


type ContextProviderProps = {
    db: Database;
    children: ReactNode;
};

export const ContextProvider:React.FC<ContextProviderProps>  = ({ db, children }) => (
    <DatabaseContext.Provider value={db}>
      <UserConnectionProvider>
        <VersionManagementProvider>
          {children}
        </VersionManagementProvider>
      </UserConnectionProvider>
    </DatabaseContext.Provider>
  );