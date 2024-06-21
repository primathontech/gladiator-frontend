import React, { useEffect } from 'react';

import ChatgptpdfUpload from '@/pages/upload';

import styles from './styles.module.scss';

const UploadPDFModal = ({ isOpen, onClose }: any) => {
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (isOpen && !event.target.closest(`.${styles.modalContent}`)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalBackground}>
            <div className={styles.modalContent}>
                <ChatgptpdfUpload isOpen={isOpen} onClose={onClose} />
            </div>
        </div>
    );
};

export default UploadPDFModal;
