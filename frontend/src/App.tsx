import { createContext, useState} from "react";
import { Route, Routes } from "react-router-dom";

// Lib
import { Logger } from '@lib/logger';

// Pages
import JoinRoom from "@pages/JoinRoom";
import CreateRoom from "@pages/CreateRoom";
import ManageRoom from "@pages/ManageRoom";
import ViewRoom from "@pages/ViewRoom";
import SketchAndVoteLand from './games/sketchAndVote/SketchAndVoteLand';

// Games
import SketchAndVoteGame from "./games/sketchAndVote/SketchAndVoteGame";
import SketchAndVoteEnd from "./games/sketchAndVote/SketchAndVoteEnd";

// Components
import Header from "@components/Header";

// Context
import SocketProvider from "@context/SocketProvider";

// Styles
import 'react-resizable/css/styles.css';
import { useLogger } from "@hooks/useLogger";

export type AppContextType = {
  logger: Logger;
  onImage: (image: string) => void;
}

export const AppContext = createContext({} as AppContextType);

function App() {
  const logger: Logger = useLogger();
  const [imgHistory, setImgHistory] = useState<string[]>([]);

  function onImage(image: string): void{
    setImgHistory([...imgHistory, image]);
    console.log(imgHistory);
  }

  return (
    <div className="size-full min-h-screen text-main flex flex-col items-center justify-center flex-grow">
        <AppContext.Provider value={{logger, onImage}}>
          <SocketProvider logger={logger}>
              <Header />
              <main className="p-5 size-full flex flex-col items-center justify-center flex-grow">
                <Routes>
                  <Route path="/joinRoom" element={<JoinRoom />} />
                  <Route path="/" element={<CreateRoom />} />
                  <Route path="/manageRoom" element={<ManageRoom />} />
                  <Route path="/viewRoom" element={<ViewRoom />}/>
                  <Route path="/sketchAndVote" element={<SketchAndVoteLand />}/>
                  <Route path="/sketchAndVoteEnd" element={<SketchAndVoteEnd />} />
                  <Route path="/standardGame" element={<SketchAndVoteGame />}/>
                </Routes>
              </main>
          </SocketProvider>
        </AppContext.Provider>
    </div>
  );
}

export default App;