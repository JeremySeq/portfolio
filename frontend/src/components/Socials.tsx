import styles from "./Socials.module.css";
import API_SERVER from "../Constants.tsx";

function Socials() {
    function handleClickSocial(social: string, url: string) {
        window.open(url, "_blank");
        fetch(`${API_SERVER}/clicked_social/${social}`, {
            method: "POST"
        })
    }

    return (
        <div className={styles.socials}>
            <h2>Socials</h2>
            <div className={styles.iconText}
                 onClick={() => handleClickSocial("github", "https://github.com/jeremyseq")}>
                <i className="fa-brands fa-github"></i> GitHub
                <strong>@JeremySeq</strong>
            </div>

            <div className={styles.iconText} onClick={() => handleClickSocial("telegram", "https://t.me/JeremySeq")}>
                <i className="fa-brands fa-telegram"></i> Telegram
                <strong>@JeremySeq</strong>
            </div>

            <div className={styles.iconText}
                 onClick={() => handleClickSocial("curseforge", "https://www.curseforge.com/members/jeremyseq/projects")}>
                <img src="/assets/curseforge.svg" alt="CurseForge logo"/> CurseForge
                <strong>@JeremySeq</strong>
            </div>

            <div className={styles.iconText}
                 onClick={() => handleClickSocial("modrinth", "https://modrinth.com/user/JeremySeq")}>
                <img src="/assets/modrinth.svg" alt="Modrinth logo"/> Modrinth
                <strong>@JeremySeq</strong>
            </div>

            <div className={styles.iconText}
                 onClick={() => handleClickSocial("patreon", "https://patreon.com/jeremyseq")}>
                <i className="fa-brands fa-patreon fa-bounce"></i> Patreon
                <strong>@JeremySeq</strong>
            </div>
        </div>
    )
}

export default Socials;