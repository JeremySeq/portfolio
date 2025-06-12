import styles from "./ProjectCard.module.css"
import React from "react";

type ProjectCardProps = {
    projectName: string;
    image: string;
    subText: string;
    onClick: () => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({projectName, image, subText, onClick}) => {
    return (
        <div className={styles.projectCardContainer} onClick={() => onClick()}>
            <img src={image} alt=""/>
            <div>
                <h3>{projectName}</h3>
                <p>{subText}</p>
            </div>
        </div>
    )
}
export default ProjectCard;