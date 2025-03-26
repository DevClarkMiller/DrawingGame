import Canvas from "./components/Canvas";

function App() {
  return (
    <div className="size-full min-h-screen text-blue-500 flex flex-col items-center justify-center flex-grow">
      <Canvas height={750} width={750} />
    </div>
  );
}

export default App
