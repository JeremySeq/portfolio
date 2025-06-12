import styles from "./tempPage.module.css"
import {useState} from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import API_SERVER from "./Constants.tsx";
import { motion } from "framer-motion";

function TempPage() {

    const [response, setResponse] = useState("");

    let end: number;
    let isCelebration: boolean = false;

    const colors = ['#0ea210', '#85cca9'];

    function celebration() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });
        if (Date.now() < end) {
            requestAnimationFrame(celebration);
        } else {
            isCelebration = false;
        }
    }

    function onClickAmazing() {
        setResponse("you have good taste, sir");

        if (!isCelebration) {
            end = Date.now() + (4 * 1000);
            isCelebration = true;
            celebration();
        }

        const form = new FormData();
        form.set("message", "amazing");

        fetch(API_SERVER + "/message", {
            method: "POST",
            body: form
        });
    }

    function onClickHorrible() {
        setResponse("well so do you, buddy");

        setTimeout(() => {
            window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        }, 1500);

        const form = new FormData();
        form.set("message", "horrible");

        fetch(API_SERVER + "/message", {
            method: "POST",
            body: form
        });
    }

    return (
        <div className={styles.main}>
            <h2>Yo, it's Jeremy</h2>

            <motion.img src="https://spinning.fish/fish.gif" alt="spinning fish"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 10
                        }}/>


            <p>Welcome to the most critically-acclaimed website since sliced bread got Wi-Fi.
            <br/>Voted <i>Website of the Year</i> by my mom, three raccoons, and a guy named Dave.</p>
            <h3>How’s it look? (Be honest... but not too honest.)</h3>

            <button onClick={onClickAmazing}>amazing</button>
            <button className={styles.response} onClick={onClickHorrible}>horrible</button>

            <h1>{response}</h1>
        </div>
    )
}

export default TempPage;