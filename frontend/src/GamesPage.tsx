import { useEffect, useState } from "react";
import styles from "./GamesPage.module.css";
import API_SERVER from "./Constants.tsx";

interface Game {
    id: number;
    title: string;
    description: string;
    url: string;
    date: string;
}

interface GamesJsonEntry {
    title: string;
    description: string;
    date?: string;
}

type GamesJson = Record<string, GamesJsonEntry>;

function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        fetch(API_SERVER + "/games")
            .then((res) => res.json())
            .then((data: GamesJson) => {
                const gameEntries: Game[] = Object.entries(data).map(([key, value], index) => ({
                    id: index + 1,
                    title: value.title,
                    description: value.description,
                    url: `/games/${key}`,
                    date: value.date || "Unknown",
                }));

                const sorted = gameEntries.sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
                });

                setGames(sorted);
            })
            .catch((error) => {
                console.error("Failed to fetch games:", error);
            });
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Games</h1>
            <p className={styles.subtitle}>Try out some of my web games below!</p>
            <ul className={styles.gameList}>
                {games.map((game) => (
                    <li key={game.id} className={styles.gameItem}>
                        <a href={game.url}>
                            <div className={styles.gameTitle}>{game.title}</div>
                            <div className={styles.gameDescription}>{game.description}</div>
                            <div className={styles.gameDate}>Last Updated: {game.date}</div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GamesPage;
