import Canvas from "./components/Canvas";

function App() {
  return (
    <div className="size-full min-h-screen text-blue-500 flex flex-col items-center justify-center flex-grow">
      <Canvas height={500} width={500} />
    </div>
  );
}

export default App
