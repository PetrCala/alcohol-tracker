import { ReactNode } from "react";
import DatabaseContext from "./DatabaseContext";
import { UserConnectionProvider } from "./UserConnectionContext";
import { VersionManagementProvider } from "./VersionContext";


type ContextProviderProps = {
    db: any;
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