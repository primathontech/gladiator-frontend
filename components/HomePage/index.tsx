/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import PDFGPT_LOGO from '@public/Images/svgs/Curio.ai.svg';

import { AppRoutes } from '../appConstant';

import UploadPDFModal from '../UploadPDFModal';
import { Data } from './contants';

import styles from './styles.module.scss';

const HomePage = () => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleClick = (id: any) => {
        if (id !== Data.length) {
            router.push(AppRoutes.CHAT);
        } else {
            openModal();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Image className={styles.logo} src={PDFGPT_LOGO} alt='logo' />
                <p className={styles.heading}>Engage, Connect, Innovate with Claire.ai</p>
            </div>
            <div className={styles.middleSection}>
                {Data.map((item) => (
                    <div
                        className={styles.middleSectionData}
                        key={item.id}
                        onClick={() => handleClick(item.id)}
                        aria-hidden
                    >
                        <div className={styles.management}>
                            <Image
                                src={item.image}
                                alt='logo'
                                width={40}
                                height={40}
                                className={styles.managementImage}
                            />
                        </div>
                        <p>{item.title}</p>
                    </div>
                ))}
            </div>
            <UploadPDFModal isOpen={isModalOpen} onClose={closeModal} />
            <p className={styles.copyRight}>© 2024 Primathon Claire.ai. All Rights Reserved.</p>
        </div>
    );
};

export default HomePage;
