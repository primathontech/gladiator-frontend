import React, { useState } from 'react';
// import Image from 'next/image';
// import { useRouter } from 'next/router';

// import PDFGPT_LOGO from '@public/Images/svgs/Curio.ai.svg';
// import CUSTOM from '@public/Images/svgs/custom.svg';
// import { APP_URL } from '../appConstant';
import UploadPDFModal from '../UploadPDFModal';

import styles from './styles.module.scss';

const HomePage = () => {
    // const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedItem, setSelectedItem] = useState<number | null>(null);
    // const [isLoading, setIsLoading] = useState(true);
    // const [pdfOptions, setPdfOptions] = useState([]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleNextClick = () => {
        openModal();
    };

    // useEffect(() => {
    //     const fetchOptions = async () => {
    //         // setIsLoading(true);
    //         try {
    //             const res = await fetch(`${APP_URL}/api/category`, {
    //                 method: 'GET',
    //             });

    //             if (res.status === 200) {
    //                 const options = await res.json();
    //                 const customOption = {
    //                     category: 'Custom',
    //                     image_url: CUSTOM,
    //                 };
    //                 // const updatedOptions: any = [...options.categories, customOption];
    //                 // setPdfOptions(updatedOptions);
    //             } else {
    //                 // Handle error
    //             }
    //         } catch (error) {
    //             console.error('Error fetching options:', error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     fetchOptions();
    // }, []);

    // const handleItemClick = (id: number) => {
    //     setSelectedItem(selectedItem === id ? null : id);
    //     const selectedItemData: any = arrayOfObjects.find((item: any) => item.id === id);

    //     if (selectedItemData) {
    //         if (selectedItemData.category !== 'Custom') {
    //             localStorage.setItem('selectedItemTitle', selectedItemData.category);
    //         } else {
    //             localStorage.setItem('selectedItemTitle', selectedItemData.category);
    //         }
    //     } else {
    //         localStorage.removeItem('selectedItemTitle');
    //     }
    // };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    {/* <Image className={styles.logo} src={PDFGPT_LOGO} alt='logo' /> */}
                    {/* <p className={styles.heading}>Chat with any PDF</p> */}
                </div>
                <div className={styles.upperText}>
                    <div className={styles.roleText}>Chat with any PDF</div>
                    <div className={styles.description}>
                        Join millions of students, researchers and professionals to instantly answer
                        questions and understand research with AI
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
