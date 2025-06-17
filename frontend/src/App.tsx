
import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import Home from "./Home.tsx";
import GamesPage from "./GamesPage.tsx";

function App() {

  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/games" element={<GamesPage/>}/>
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
