/* eslint-disable no-restricted-properties */
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LinearProgress from '@mui/material/LinearProgress';

import UPLOAD_DOC from '@public/Images/pngs/document-upload1.png';
import CLOSE from '@public/Images/svgs/close.svg';
import { AppRoutes, UPLOAD_API_URL } from '@/components/appConstant';

import styles from './style.module.scss';

const UploadPdf = ({ onClose }: any) => {
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [isSelected, setIsSelected] = useState(false);
    const router = useRouter();

    const handleSubmit = async (selectedFile: any) => {
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(UPLOAD_API_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    // No need to set 'Content-Type' header for FormData, it is automatically set.
                },
            });
            const data = await response.json();
            // Check if status code is 200 OK before refreshing
            if (response.status === 200) {
                toast.success('PDF has been uploaded successfully! ');
                if (router.asPath === '/') {
                    router.push(AppRoutes.CUSTOM_CHAT);
                } else {
                    router.reload();
                }
            } else {
                toast.error(data.data.message);
            }
        } catch (error) {
            toast.error('Failed to upload PDF. Please try again.');
            setIsSelected(false);
        }
    };

    function formatBytes(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    const handleChange = (event: any) => {
        const files = event.target.files[0];
        setSelectedFile(files);
        setIsSelected(true);
        handleSubmit(files);
    };

    const handleFileDrop = (event: any) => {
        event.preventDefault();
        const files = event.dataTransfer.files[0];
        setSelectedFile(files);
        setIsSelected(true);
        handleSubmit(files);
    };

    return (
        <div
            className={styles.pdfContainer}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleFileDrop}
        >
            <div className={styles.headingContainer}>
                <div>
                    <h1 className={styles.heading}>Drop your PDF here</h1>
                    <h2 className={styles.subHeading}>Ready to Chat with Your PDF? Upload Here!</h2>
                </div>
                <Image src={CLOSE} alt='close' className={styles.closeImage} onClick={onClose} />
            </div>
            {isSelected ? (
                <div className={styles.uploadingDocContainer}>
                    <div className={styles.uploadingDoc}>
                        <Image
                            src={UPLOAD_DOC}
                            alt='upload document'
                            className={styles.docUploadImage}
                        />
                        <div>
                            <p className={styles.fileName}>{selectedFile.name}</p>
                            <p className={styles.fileSize}>{formatBytes(selectedFile.size)}</p>
                        </div>
                    </div>
                    <LinearProgress
                        style={{ height: '6px', borderRadius: '45px' }}
                        color='success'
                    />
                </div>
            ) : (
                <div className={styles.documentContainer}>
                    {/* <Image src={UPLOAD_DOC} alt='upload document' className={styles.uploadImage} /> */}
                    <span className={styles.docUpload}>
                        <label htmlFor='fileInput' className={styles.fileUpload}>
                            select to upload PDF file
                            <input
                                id='fileInput'
                                type='file'
                                accept='.pdf'
                                onChange={handleChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </span>
                </div>
            )}
            <div className={styles.buttonContainer}>
                {router.asPath === '/' && (
                    <Link href='/chatwithpdf' className={styles.skip}>
                        Skip upload PDF file
                    </Link>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default UploadPdf;
