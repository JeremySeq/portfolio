import styles from "./GamesPage.module.css";

function GamesPage() {
    const games = [
        {
            id: 1,
            title: "Heatseeker",
            url: "/games/heatseeker",
            date: "6/2/2025",
            description: "Dodge missiles in a fast-paced rocket survival game."
        }
    ];

    // sort games by date (latest first)
    const sortedGames = [...games].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Games</h1>
            <p className={styles.subtitle}>Try out some of my web games below!</p>
            <ul className={styles.gameList}>
                {sortedGames.map((game) => (
                    <li key={game.id} className={styles.gameItem}>
                        <a href={game.url}>
                            <div className={styles.gameTitle}>{game.title}</div>
                            <div className={styles.gameDescription}>{game.description}</div>
                            <div className={styles.gameDate}>{game.date}</div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GamesPage;
