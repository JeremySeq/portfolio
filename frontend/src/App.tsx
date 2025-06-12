
import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import Home from "./Home.tsx";

function App() {

  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/projects" element={<h1></h1>}/>
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
