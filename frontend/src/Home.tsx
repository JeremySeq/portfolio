import styles from "./home.module.css"
import ProjectCard from "./components/ProjectCard.tsx";
import TempPage from "./TempPage.tsx";
import {useEffect, useState} from "react";
import API_SERVER from "./Constants.tsx";
import LoadingSpinner from "./components/LoadingSpinner.tsx";
import { motion } from "framer-motion";
import Socials from "./components/Socials.tsx";

type Project = {
    name: string;
    downloads: number;
    image: string | null;
    link: string | null;
};

function formatDownloads(count: number, word_for_million: boolean = false): string {
    if (count < 0) {
        return "--"
    } else if (count >= 1000000) {
        const value = Math.floor((count / 1000000) * 10) / 10;
        if (word_for_million) {
            return (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + " million";
        }
        return (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + "M";
    }
    if (count >= 1000) {
        const value = Math.floor((count / 1000) * 10) / 10;
        return (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + "k";
    }
    return count.toString();
}

function Home() {

    const [showAllProjects, setShowAllProjects] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [totalDownloads, setTotalDownloads] = useState<number>(-1);
    const [loading, setLoading] = useState(true);

    const standardVariants = {
        hidden: { opacity: 0, y: -30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeInOut" }
        }
    };

    const projectCardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    useEffect(() => {
        fetch(API_SERVER + "/mod_data")
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setProjects(data.projects || []);
                setTotalDownloads(data.total || 0);
            })
            .catch((error) => {
                console.error("Failed to fetch mod data:", error);
            })
            .finally(() => setLoading(false));
    }, []);

    return (

        <div className={styles.main}>

            <motion.div className={styles.left} variants={standardVariants}
                        initial="hidden"
                        animate="visible">
                <motion.div initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: .6, ease: "easeInOut" }}>
                    <div className={styles.heading}>
                        <div className={styles.hello}>Hello, I'm</div>
                        <h1 className={styles.name}>Jeremy<br/>Sequeira</h1>
                    </div>

                    <div className={styles.headingDescription}>Software developer specializing in Minecraft modding,
                        game dev, & web dev
                    </div>
                </motion.div>


                {/*<button className="contact-me-btn">Contact Me</button>*/}

                <div className={styles.break}></div>

                <div className={styles.aboutMe}>
                    <h2>About Me</h2>

                    <p>Lorem ipsum dolor sit amet, ego sum maximus coderus. Gloriosus scriptori Java et Python, dominus websitium et moddicus Minecraftium. Nihil buggi me vincit. Ubi code, ibi ego. Genius? Immo deus.</p>
                </div>
                <TempPage></TempPage>
            </motion.div>

            <motion.div className={styles.right}
                        variants={standardVariants}
                        initial="hidden"
                        animate="visible">
                <div className={styles.mods}>
                    <h2 className={styles.projectHeader}>Minecraft Mods
                        <span className={`${styles.statusTag} ${styles.updating}`}>
                            {"Active"}
                        </span>
                    </h2>
                    <div className={styles.techTagList}>
                        <span className={styles.techTag}>Java</span>
                        <span className={styles.techTag}>Minecraft</span>
                    </div>
                    <p className={styles.projectSubheader}>I make Minecraft mods on Curseforge and Modrinth, which currently
                        total
                        over <strong>{formatDownloads(totalDownloads, true)} downloads</strong>.</p>

                    <div className={styles.modList}>
                        {
                            loading ? <LoadingSpinner size="48px"/> : null
                        }

                        {(showAllProjects ? projects : projects.slice(0, 2)).map((project, index) => (
                            <motion.div
                                key={index}
                                variants={projectCardVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <ProjectCard
                                    key={index}
                                    projectName={project.name}
                                    image={project.image ?? ""}
                                    subText={formatDownloads(project.downloads) + " downloads"}
                                    onClick={() => {
                                        if (project.link) {
                                            window.open(project.link, "_blank");
                                        }
                                    }}
                                />
                            </motion.div>
                        ))}

                        {projects.length > 2 && (
                            <button className={styles.moreMods}
                                    onClick={() => setShowAllProjects(!showAllProjects)}>
                                {showAllProjects
                                    ? "Show less"
                                    : `+ ${projects.length - 2} more`}
                                <br/>
                                <i className={`fa-solid ${showAllProjects ? "fa-arrow-up" : "fa-arrow-down"}`}></i>
                            </button>
                        )}

                    </div>
                </div>

                <div className={styles.break}></div>

                <div className={styles.protonmc}>
                    <h2 className={styles.projectHeader}>ProtonMC
                        <span className={`${styles.statusTag} ${styles.updating}`}>
                            {"Active"}
                        </span>
                    </h2>
                    <div className={styles.techTagList}>
                        <span className={styles.techTag}>Python</span>
                        <span className={styles.techTag}>Flask</span>
                        <span className={styles.techTag}>React</span>
                        <span className={styles.techTag}>Web Design</span>
                    </div>
                    <p className={styles.projectSubheader}>A lightweight remote control panel for managing
                        Minecraft servers.
                        <br/>
                        Because manually managing Minecraft servers is a special kind of torture. So I built this to save us all. You're welcome.</p>

                    <a className={styles.projectGithub} href="https://github.com/jeremyseq/protonmc" target="_blank" rel="noopener">
                        <i className="fa-brands fa-github"></i> Open-Source on GitHub
                    </a>

                    <ul className={styles.projectTechList}>
                        <li>Remote server control: Start, stop, restart servers from anywhere via a web interface</li>
                        <li>Session-based user authentication: Secure login system using tokens and session
                            persistence
                        </li>
                        <li>Supports major server types: One-click install for Spigot, Forge, Fabric, and
                            NeoForge
                        </li>
                        <li>Mod/plugin management: Install from CurseForge/Modrinth without leaving the website</li>
                        <li>Modern frontend: Built with React, clean and fast</li>
                    </ul>
                </div>

                <div className={styles.break}></div>

                <div className={styles.multiplayerGame}>

                    <h2 className={styles.projectHeader}>Clashlings
                        <span className={`${styles.statusTag} ${styles.wip}`}>
                            {"Work in Progress"}
                        </span>
                    </h2>

                    <div className={styles.techTagList}>
                        <span className={styles.techTag}>Java</span>
                        <span className={styles.techTag}>No Game Engine</span>
                        <span className={styles.techTag}>Networking</span>
                        <span className={styles.techTag}>Pathfinding</span>
                        <span className={styles.techTag}>Game Design</span>
                    </div>

                    <p className={styles.projectSubheader}>
                    A 2D co-op game where players defend their village from waves of goblins by gathering resources,
                        building, and surviving escalating attacks.
                    </p>

                    <a className={styles.projectGithub} href="https://github.com/JeremySeq/MultiplayerGame" target="_blank" rel="noopener">
                        <i className="fa-brands fa-github"></i> Open-Source on GitHub
                    </a>

                    <ul className={styles.projectTechList}>
                        <li>Multiplayer networking: Players can join and play together online</li>
                        <li>Goblin pathfinding: Enemies navigate through multiple map layers</li>
                        <li>Level system with editor: Create and modify game levels easily</li>
                        <li>Combat system: Handles player and enemy attacks</li>
                        <li>Collision detection: Players collide with obstacles to block movement</li>
                    </ul>

                </div>

                <div className={styles.break}></div>


            </motion.div>

            <div className={styles.side}>
                <Socials/>
            </div>

        </div>
    )
}

export default Home;