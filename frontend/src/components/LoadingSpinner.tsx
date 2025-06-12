import styles from "./LoadingSpinner.module.css"
import React from "react";

type LoadingSpinnerProps = {
    size: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({size}) => {
    return (
        <div className={styles.loader} style={{width: size, height: size}}></div>
    );
}
export default LoadingSpinner;