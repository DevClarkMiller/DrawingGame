import { Route, Routes } from "react-router-dom";

// Pages
import JoinRoom from "./pages/JoinRoom";
import CreateRoom from "./pages/CreateRoom";
import ManageRoom from "./pages/ManageRoom";
import ViewRoom from "./pages/ViewRoom";
import SketchAndVoteLand from './games/sketchAndVote/SketchAndVoteLand';

// Testing
import StandardGame from "./games/StandardGame";

// Components
import Header from "./components/Header";

// Context
import SocketProvider from "./context/SocketProvider";

function App() {
  return (
    <div className="size-full min-h-screen text-main flex flex-col items-center justify-center flex-grow">
      <SocketProvider>
        <Header />
        <main className="p-5 size-full flex flex-col items-center justify-center flex-grow">
          <Routes>
            <Route path="/joinRoom" element={<JoinRoom />} />
            <Route path="/" element={<CreateRoom />} />
            <Route path="/manageRoom" element={<ManageRoom />} />
            <Route path="/viewRoom" element={<ViewRoom />}/>
            <Route path="/sketchAndVote" element={<SketchAndVoteLand />}/>
            <Route path="/standardGame" element={<StandardGame />}/>
          </Routes>
        </main>
      </SocketProvider>
    </div>
  );
}

export default App
