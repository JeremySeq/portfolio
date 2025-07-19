import React, {useEffect, useRef, useState} from "react";
import styles from "./SumItUpPage.module.css";
// @ts-ignore
import confetti from "canvas-confetti";
import API_SERVER from "../../Constants.tsx";
import {AnimatePresence, motion} from "framer-motion";

interface Puzzle {
    grid: number[][],
    rowSums: number[],
    colSums: number[],
    date: string
}

const phrases = [
    "Sharpen your brain cell. Yes, just the one.",
    "Math isn’t for everyone — you’ll prove that soon.",
    "You're not ready. But go ahead anyway.",
    "You'll probably need a calculator for this.",
    "A toddler could do this. Probably faster than you.",
    "Your IQ better be higher than this grid size."
];

const SIZE = 5;

export default function SumItUpPage() {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [removed, setRemoved] = useState<boolean[][]>([]);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [solved, setSolved] = useState(false);
    const [username, setUsername] = useState(() => {
        return localStorage.getItem("sumitup-username") || "Anonymous";
    });

    const [correctRows, setCorrectRows] = useState<boolean[]>(Array(SIZE).fill(false));
    const [correctCols, setCorrectCols] = useState<boolean[]>(Array(SIZE).fill(false));

    const [gameStarted, setGameStarted] = useState(false);
    const timerRef = useRef<number | null>(null);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const today = new Date().toISOString().slice(0, 10);

    const storedSolve = localStorage.getItem(`puzzleSolved-${today}`);
    const isAlreadySolved = !!storedSolve;
    const storedData = storedSolve ? JSON.parse(storedSolve) : null;

    interface LeaderboardEntry {
        name: string;
        time: number;
    }

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [averageTime, setAverageTime] = useState<number | null>(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex(i => (i + 1) % phrases.length);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetch(API_SERVER + "/games/sumitup/leaderboard")
            .then(res => res.json())
            .then(data => {
                setLeaderboard(data.leaderboard);
                setAverageTime(data.average_time);
            })
            .catch((err) => console.error("Failed to load leaderboard:", err));
    }, [showLeaderboard]);

    const standardVariants = {
        hidden: { opacity: 0, y: -30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 1, ease: "easeInOut" }
        }
    };

    function startConfetti() {
        const duration = 10 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 200);
    }

    useEffect(() => {
        if (!gameStarted && !isAlreadySolved) return;

        fetch(API_SERVER + "/games/sumitup/")
            .then(res => res.json())
            .then(data => {
                setPuzzle(data);

                if (isAlreadySolved && storedData) {
                    setRemoved(storedData.removed);
                    setElapsedSeconds(storedData.time);
                    setSolved(true);
                    setGameStarted(true);
                } else {
                    setRemoved(Array.from({ length: SIZE }, () => Array(SIZE).fill(false)));
                    setElapsedSeconds(0);
                    setSolved(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                    timerRef.current = window.setInterval(() => setElapsedSeconds(t => t + 1), 1000);
                }
            });

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameStarted]);

    const toggleCell = (row: number, col: number) => {
        const newRemoved = removed.map(r => [...r]);
        newRemoved[row][col] = !newRemoved[row][col];
        setRemoved(newRemoved);
        checkWin(newRemoved);
    };

    const checkWin = (removedGrid: boolean[][]) => {
        if (!puzzle) return;

        let success = true;
        const newCorrectRows = Array(SIZE).fill(false);
        const newCorrectCols = Array(SIZE).fill(false);

        for (let r = 0; r < SIZE; r++) {
            let sum = 0;
            for (let c = 0; c < SIZE; c++) {
                if (!removedGrid[r][c]) sum += puzzle.grid[r][c];
            }
            if (sum === puzzle.rowSums[r]) {
                newCorrectRows[r] = true;
            } else {
                success = false;
            }
        }

        for (let c = 0; c < SIZE; c++) {
            let sum = 0;
            for (let r = 0; r < SIZE; r++) {
                if (!removedGrid[r][c]) sum += puzzle.grid[r][c];
            }
            if (sum === puzzle.colSums[c]) {
                newCorrectCols[c] = true;
            } else {
                success = false;
            }
        }

        setCorrectRows(newCorrectRows);
        setCorrectCols(newCorrectCols);

        if (success) {
            if (timerRef.current) clearInterval(timerRef.current);
            startConfetti();
            const today = new Date().toISOString().slice(0, 10);
            localStorage.setItem(`puzzleSolved-${today}`, JSON.stringify({
                removed: removedGrid,
                time: elapsedSeconds
            }));

            fetch(API_SERVER + "/games/sumitup/solved", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date: today,
                    time: elapsedSeconds,
                    name: username.trim() || "Anonymous",
                }),
            }).catch((err) => {
                console.error("Failed to report puzzle solve:", err);
            });


            setSolved(true);
        }
    };

    const handleShare = () => {
        if (!puzzle) return;
        const msg = `Sum It Up!\n ${puzzle.date}\n Time: ${elapsedSeconds}s\n https://jeremyseq.dev/games/sumitup`;
        navigator.clipboard.writeText(msg).then(() => alert("Copied!"));
    };

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.gameContainer}
                variants={standardVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className={styles.title}>Sum It Up!</h1>

                {!gameStarted && (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={phrases[phraseIndex]}
                                className={styles.preparePhrase}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -10}}
                                transition={{duration: 0.4}}
                            >
                                {phrases[phraseIndex]}
                            </motion.p>
                        </AnimatePresence>
                        <p className={styles.usernameLabel}>Type a name if you want to be on the leaderboard:</p>
                        <input
                            className={styles.usernameInput}
                            type="text"
                            maxLength={20}
                            placeholder="Anonymous"
                            value={username}
                            onChange={(e) => {
                                const name = e.target.value;
                                setUsername(name);
                                localStorage.setItem("sumitup-username", name);
                            }}
                        />

                        <br/>
                        <button
                            className={styles.leaderboardToggleBtn}
                            onClick={() => setShowLeaderboard((prev) => !prev)}
                        >
                            {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
                        </button>

                        <p className={styles.explanation}>
                            How it works (not that it’s hard):<br/>
                            You’re given a grid. Each row and column has a number it’s supposed to add up to.
                            Your job? Click the little squares to turn them on or off until all the rows and columns
                            match their target sums.
                            It’s just basic math and clicking. You can handle that, right? …Right?
                        </p>


                        <button className={styles.startBtn} onClick={() => setGameStarted(true)}>
                            START
                        </button>

                    </>
                )}

                {gameStarted && puzzle && (
                    <>
                        <div className={styles.infoBar}>
                            <div>{`Puzzle for ${puzzle.date}`}</div>
                            <div>{username}</div>
                            <div><i className="fa-solid fa-clock"></i> Time: {elapsedSeconds}s</div>
                        </div>

                        <div className={styles.grid}>
                            {Array.from({length: SIZE + 1}, (_, row) => (
                                <React.Fragment key={row}>
                                    {Array.from({length: SIZE + 1}, (_, col) => {
                                        if (row === SIZE && col === SIZE) return null;

                                        const isSum = row === SIZE || col === SIZE;
                                        const value =
                                            row < SIZE && col < SIZE
                                                ? puzzle.grid[row][col]
                                                : row === SIZE
                                                    ? puzzle.colSums[col]
                                                    : puzzle.rowSums[row];

                                        const isRemoved = row < SIZE && col < SIZE && removed[row][col];

                                        const isCorrectSum =
                                            (row === SIZE && correctCols[col]) ||
                                            (col === SIZE && correctRows[row]);

                                        const cellClass = [
                                            styles.cell,
                                            isSum ? styles.sum : "",
                                            isRemoved ? styles.removed : "",
                                            isSum && isCorrectSum ? styles.correctSum : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ");

                                        return (
                                            <div
                                                key={col}
                                                className={cellClass}
                                                onClick={() => !isSum && !solved && toggleCell(row, col)}
                                            >
                                                {value}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className={styles.shareSection}>
                            <p className={styles.status}>
                                {solved ? `You solved it in ${elapsedSeconds}s!` : ""}
                            </p>
                            {solved && (
                                <div>
                                    <button className={styles.shareBtn} onClick={handleShare}>
                                        Share <i className="fa-solid fa-share"></i>
                                    </button>
                                    <button
                                        className={styles.shareBtn}
                                        onClick={() => setShowLeaderboard((prev) => !prev)}
                                    >
                                        Leaderboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>

            <AnimatePresence>
                {showLeaderboard && leaderboard && (
                    <motion.div
                        className={styles.leaderboardContainer}
                        initial={{opacity: 0, y: -20}}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className={styles.leaderboard}>
                            <h2 className={styles.title}>Leaderboard</h2>
                            {leaderboard.length === 0 && !solved ? (
                                <p>You could finally be first at something.</p>
                            ) : (
                                <div>
                                    <p>Average Time: {averageTime?.toFixed(2)}</p>
                                    <ol>
                                        {leaderboard.slice(0, 5).map((entry, i) => (
                                            <li key={i}>
                                                <strong>{entry.name || "Anonymous"}</strong> – {entry.time}s
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>

    );
}
