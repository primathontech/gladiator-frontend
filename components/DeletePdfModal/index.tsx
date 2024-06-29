import React, { useCallback, useEffect } from 'react';
import Image from 'next/image';

import CLOSE from '@public/Images/svgs/close.svg';
import { toast } from 'react-toastify';
import { APP_URL } from '../appConstant';

import styles from './styles.module.scss';

const DeletePdfModal = ({ isDeletePdfModalOpen, onClose, pdfName, fetchOptions }: any) => {
    const handleDelete = useCallback(
        async (pdfName: string) => {
            try {
                const res = await fetch(`${APP_URL}/api/files/${pdfName}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200) {
                    toast.success('Pdf File deleted successfully');
                    onClose();
                    fetchOptions();
                } else {
                    toast.error('Failed to delete');
                }
            } catch (error) {
                toast.error('Something went wrong');
            }
        },
        [onClose, fetchOptions],
    );

    const handleDeletePdf = () => {
        if (isDeletePdfModalOpen) {
            handleDelete(pdfName);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (isDeletePdfModalOpen && !event.target.closest(`.${styles.modalContent}`)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDeletePdfModalOpen, onClose]);

    if (!isDeletePdfModalOpen) return null;

    return (
        <div className={styles.modalBackground}>
            <div className={styles.modalContent}>
                <h4 className='text-black font-bold text-2xl'>Delete Chat</h4>
                <p className='text-black mt-1'>Do you really want to delete this chat?</p>
                <p className='text-gray-500 mt-2'>
                    This will permanently delete the chat and PDF content from ChatPDF.
                </p>

                <div className='flex gap-x-4 justify-end mt-8'>
                    <button
                        onClick={onClose}
                        className='bg-white text-black text-xl rounded-md border px-4 py-2'
                        type='button'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeletePdf}
                        className='bg-red-500 hover:bg-red-600 text-white text-xl rounded-md px-4 py-2'
                        type='button'
                    >
                        Delete
                    </button>
                </div>
                <div className='absolute top-8 right-11 cursor-pointer'>
                    <Image
                        src={CLOSE}
                        alt='close'
                        className={styles.closeImage}
                        onClick={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default DeletePdfModal;
