import { createContext, useContext, useState } from 'react';

const LeagueContext = createContext();
export const useLeague = () => useContext(LeagueContext);

export const LeagueProvider = ({ children }) => {
    const [selectedLeague, setSelectedLeague] = useState(null);
    return (
        <LeagueContext.Provider value={{ selectedLeague, setSelectedLeague }}>
            {children}
        </LeagueContext.Provider>
    );
};
