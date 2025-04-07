import { useMemo, createContext } from "react";
import { Route, Routes } from "react-router-dom";

// Lib
import { DevelopmentLogger, ProductionLogger, Logger } from '@lib/logger';

// Pages
import JoinRoom from "@pages/JoinRoom";
import CreateRoom from "@pages/CreateRoom";
import ManageRoom from "@pages/ManageRoom";
import ViewRoom from "@pages/ViewRoom";
import SketchAndVoteLand from './games/sketchAndVote/SketchAndVoteLand';

// Testing
import StandardGame from "./games/StandardGame";

// Components
import Header from "@components/Header";
import DraggableImage from "@components/DraggableImage";

// Context
import SocketProvider from "@context/SocketProvider";

// Styles

export type AppContextType = {
  logger: Logger;
}

export const AppContext = createContext({} as AppContextType);

function App() {
  const logger: Logger = useMemo(() =>{
    if ((process.env.ENV || "DEV") === 'DEV'){
      return new DevelopmentLogger();
    }else{
      return new ProductionLogger();
    }
  }, []);

  return (
    <div className="size-full min-h-screen text-main flex flex-col items-center justify-center flex-grow">
        <SocketProvider logger={logger}>
          <AppContext.Provider value={{logger: logger}}>
            <Header />
            <main className="p-5 size-full flex flex-col items-center justify-center flex-grow">
              <DraggableImage />
              <Routes>
                <Route path="/joinRoom" element={<JoinRoom />} />
                <Route path="/" element={<CreateRoom />} />
                <Route path="/manageRoom" element={<ManageRoom />} />
                <Route path="/viewRoom" element={<ViewRoom />}/>
                <Route path="/sketchAndVote" element={<SketchAndVoteLand />}/>
                <Route path="/standardGame" element={<StandardGame />}/>
              </Routes>
            </main>
          </AppContext.Provider>
        </SocketProvider>
    </div>
  );
}

export default App
