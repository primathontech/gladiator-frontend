import React, { useState } from 'react';
import UploadPDFModal from '../UploadPDFModal';

import styles from './styles.module.scss';

const HomePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleNextClick = () => {
        openModal();
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.upperText}>
                    <div className={styles.roleText}>Chat with any PDF</div>
                    <div className={styles.description}>
                        Empower Your Learning with AI: Instantly Summarize, Chat, and Get Answers
                        from Your PDFs
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <button
                        className={styles.nextButton}
                        onClick={handleNextClick}
                        aria-hidden
                        type='button'
                    >
                        Drop PDF here
                    </button>
                </div>

                <UploadPDFModal isOpen={isModalOpen} onClose={closeModal} />

                <p className={styles.copyRight}>© 2024 Team AI-Gladiators All Rights Reserved.</p>
            </div>
        </>
    );
};

export default HomePage;
