import { createContext } from 'react';
import { Database } from 'firebase/database';

const DatabaseContext = createContext<Database | null>(null);

export default DatabaseContext;