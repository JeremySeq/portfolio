
import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import Home from "./Home.tsx";
import GamesPage from "./GamesPage.tsx";
import SumItUpPage from "./pages/sumitup/SumItUpPage.tsx";

function App() {

  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/games" element={<GamesPage/>}/>
                <Route path="/games/sumitup" element={<SumItUpPage/>}/>
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
