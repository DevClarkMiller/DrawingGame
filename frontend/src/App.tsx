import { Route, Routes } from "react-router-dom";

// Pages
import JoinRoom from "./pages/JoinRoom";
import CreateRoom from "./pages/CreateRoom";

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
        <main className="size-full flex flex-col items-center justify-center flex-grow">
          <Routes>
            <Route path="/joinRoom" element={<JoinRoom />} />
            <Route path="/createRoom" element={<CreateRoom />} />
          </Routes>
        </main>
        {/* <Canvas height={500} width={500} /> */}
      </SocketProvider>
    </div>
  );
}

export default App
