import { Route, Routes } from "react-router-dom";

// Pages
import JoinRoom from "./pages/JoinRoom";
import CreateRoom from "./pages/CreateRoom";
import ManageRoom from "./pages/ManageRoom";
import ViewRoom from "./pages/ViewRoom";

// Components
import Canvas from "./components/Canvas";
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
            <Route path="/createRoom" element={<CreateRoom />} />
            <Route path="/manageRoom" element={<ManageRoom />} />
            <Route path="/viewRoom" element={<ViewRoom />}/>
          </Routes>
        </main>
        {/* <Canvas height={500} width={500} /> */}
      </SocketProvider>
    </div>
  );
}

export default App
