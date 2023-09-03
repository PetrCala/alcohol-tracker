import { ReactNode } from "react";
import DatabaseContext from "./DatabaseContext";
import { UserConnectionProvider } from "./UserConnectionContext";
import { VersionManagementProvider } from "./VersionContext";


type ContextProviderProps = {
    db: any;
    children: ReactNode;
};

const ContextProvider:React.FC<ContextProviderProps>  = ({ db, children }) => (
    <DatabaseContext.Provider value={db}>
      <UserConnectionProvider>
        <VersionManagementProvider>
          {children}
        </VersionManagementProvider>
      </UserConnectionProvider>
    </DatabaseContext.Provider>
  );

export default ContextProvider;