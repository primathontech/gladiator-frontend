/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import cx from 'classnames';
import Image from 'next/image';
import Typing from 'react-typing-animation';
import { toast, ToastContainer } from 'react-toastify';

import { Message, ClickOrPressEvent } from 'types/chat';
import { Document } from 'langchain/document';

import DOCUMENT_UPLOAD from '@public/Images/svgs/document-upload.svg';
import AI_AVATAR from '@public/Images/pngs/chat.png';
import NO_RECORD from '@public/Images/pngs/no-record.png';
import NO_HISTORY from '@public/Images/pngs/nohistory.png';
import SUBMIT_ICON from '@public/Images/svgs/submit.svg';
import USERICON_IMAGE from '@public/Images/pngs/usericon.png';
import HISTORY from '@public/Images/svgs/timer.svg';
import LoadingDots from '@components/ui/LoadingDots';
import Delete from '@public/Images/svgs/delete.svg';

import ShimmerUiContainer from '@components/ShimmerContainer';
import UploadPDFModal from '@/components/UploadPDFModal';
import DeletePdfModal from '@/components/DeletePdfModal';
import { APP_URL, ApiRoute, AppRoutes } from '@/components/appConstant';
import { renderMessageContent } from '@/utils/helper';

import styles from './styles.module.scss';

const DesktopChat = () => {
    const [query, setQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [messageState, setMessageState] = useState<{
        messages: Message[];
        pending?: string;
        history?: [string, string][];
        pendingSourceDocs?: Document[];
    }>({
        messages: [
            {
                message:
                    'Your PDF AI - like ChatGPT but for PDFs. Summarize and answer questions for free.',
                type: 'apiMessage',
            },
        ],
        pendingSourceDocs: [],
    });
    const router = useRouter();
    const type = router.route;
    const selectedCategory = localStorage.getItem('selectedItemTitle');

    let type1;
    if (type === '/chat') {
        type1 = selectedCategory;
    }
    const [selectedValue, setSelectedValue] = useState(type1);
    const [selectedPdf, setSelectedPdf] = useState('');
    const [pdfOptions, setPdfOptions] = useState([]);
    const [selectedPdfCard, setSelectedPdfCard] = useState(null);
    const [, setPreviousUserText] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [, setDropdownIndex] = useState(null);

    // Add a state to track whether the response has been received from the API
    const [pdfLoading, setPdfLoading] = useState(false);

    const { messages, pending, history, pendingSourceDocs } = messageState;

    const messageListRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleClickPdf = (index: any, data: any) => {
        setSelectedPdfCard(index);
        setSelectedValue('');
        setSelectedPdf(data);
        setMessageState({
            messages: [
                {
                    message:
                        'Empower Your Learning with AI: Instantly Summarize, Chat, and Get Answers from Your PDFs',
                    type: 'apiMessage',
                },
            ],
            pendingSourceDocs: [],
            pending: undefined,
        });
    };

    // Common code for fetch functions extracted fetch function

    // eslint-disable-next-line consistent-return
    async function fetchOptions(
        url: string,
        method: string,
        body?: any,
        callback?: (response: any) => void,
    ) {
        setLoading(true);
        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : '',
            });

            if (res.status === 200) {
                const response = await res.json();
                if (callback) callback(response);

                return response;
                // eslint-disable-next-line no-else-return
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: ClickOrPressEvent) {
        e.preventDefault();

        if (!query) {
            toast.error('Please input a question');
            setLoading(false);

            return;
        }

        setPreviousUserText(query.trim());
        const question = query.trim();

        setMessageState((state) => ({
            ...state,
            messages: [
                ...state.messages,
                {
                    type: 'userMessage',
                    message: question,
                },
            ],
            pending: undefined,
        }));

        setQuery('');
        setMessageState((state) => ({ ...state, pending: '' }));

        const requestBody: any = {
            question,
            history,
            filename: selectedValue || `${selectedPdf}`,
        };

        if (type === '/chat') {
            requestBody.category = 'Categories';
        }

        const response = await fetchOptions(`${APP_URL}${ApiRoute.CHAT_API}`, 'POST', requestBody);

        if (response) {
            setMessageState((state) => ({
                ...state,
                messages: [
                    ...state.messages,
                    {
                        type: 'apiMessage',
                        message: response.answer,
                    },
                ],
            }));
        }
    }

    useEffect(() => {
        if (selectedPdf) {
            fetchOptions(
                `${APP_URL}${ApiRoute.CHAT_API}`,
                'POST',
                {
                    question: 'Summary',
                    filename: selectedPdf,
                },
                (response) => {
                    if (response) {
                        setMessageState((state) => ({
                            ...state,
                            messages: [
                                ...state.messages,
                                {
                                    type: 'apiMessage',
                                    message: response.answer,
                                },
                            ],
                        }));
                    }
                },
            );
        }
    }, [selectedPdf]);

    // prevent empty submissions
    const handleEnter = useCallback(
        (e: ClickOrPressEvent) => {
            if (e.key === 'Enter' && query) {
                handleSubmit(e);
            } else if (e.key === 'Enter') {
                e.preventDefault();
            }
        },
        [query],
    );

    const chatMessages = useMemo(
        () => [
            ...messages,
            ...(pending
                ? [
                      {
                          type: 'apiMessage',
                          message: pending,
                          sourceDocs: pendingSourceDocs,
                      },
                  ]
                : []),
        ],
        [messages, pending, pendingSourceDocs],
    );

    useEffect(() => {
        textAreaRef.current?.focus();
    }, []);

    const fetchOptionsPdfList = async () => {
        setPdfLoading(true);
        try {
            const res = await fetch(`${APP_URL}/api/files`, {
                method: 'GET',
            });
            if (res.status === 200) {
                const options = await res.json();
                if (type === '/chatwithpdf') {
                    setPdfOptions(options.files);
                }
            } else {
                // Handle error
                console.error('Failed to fetch files');
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        } finally {
            setPdfLoading(false);
        }
    };

    useEffect(() => {
        fetchOptionsPdfList();
    }, []);

    // scroll to bottom of chat
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeletePdfModalOpen, setIsDeletePdfModalOpen] = useState<boolean>(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const openDeleteModal = () => {
        setIsDeletePdfModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeletePdfModalOpen(false);
    };

    const handleClickOutside = () => {
        setDropdownVisible(false);
    };

    useEffect(() => {
        if (dropdownVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (e: any, idx: any) => {
        e.stopPropagation();
        setDropdownVisible(!dropdownVisible);
        setDropdownIndex(idx);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftContainer}>
                <div className='flex justify-center items-center mb-4 mt-4'>
                    <h1
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            paddingLeft: '20px',
                            color: 'white',
                            backgroundColor:
                                'bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent',
                        }}
                    >
                        <Link href={AppRoutes.HOME}>AI-Gladiator </Link>
                    </h1>

                    <UploadPDFModal isOpen={isModalOpen} onClose={closeModal} />
                </div>
                <div className={styles.chatHeaderContainer}>
                    {type === '/chatwithpdf' && (
                        <div>
                            <button
                                onClick={openModal}
                                className={styles.uploadButton}
                                type='button'
                            >
                                <span className='text-[24px] font-extrabold flex justify-center align-center gap-2'>
                                    +
                                </span>
                                Drop PDF here
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.container}>
                    <div className={styles.dropdownStyle}>
                        <div className={styles.dropdownLabelStyle}>
                            <Image
                                src={type === '/chatwithpdf' ? DOCUMENT_UPLOAD : HISTORY}
                                alt='docuement-upload'
                                width={20}
                                height={20}
                            />
                            <p>
                                {type === '/chatwithpdf'
                                    ? 'Uploaded Pdf List'
                                    : 'Previous Uploaded Pdf History'}
                            </p>
                        </div>

                        <div className={styles.previousPdfUploadList}>
                            {pdfLoading ? (
                                <div className={styles.emptyStateMessage}>
                                    <ShimmerUiContainer
                                        className={styles.shimmerUi}
                                        variant='rectangular'
                                        animation='wave'
                                    />
                                </div>
                            ) : pdfOptions.length > 0 ? (
                                pdfOptions.map((data, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.card} ${
                                            selectedPdfCard === index ? styles.selectedCard : ''
                                        }`}
                                        onClick={() => handleClickPdf(index, data)}
                                        aria-hidden
                                    >
                                        <p className={styles.cardData}>{data}</p>
                                        {selectedPdfCard === index && (
                                            <div
                                                aria-controls='simple-menu'
                                                aria-haspopup='true'
                                                aria-hidden
                                                onClick={(e) => handleOptionClick(e, index)}
                                            >
                                                <div
                                                    onClick={openDeleteModal}
                                                    className={styles.dropdownItem}
                                                    aria-hidden
                                                >
                                                    <Image
                                                        src={Delete}
                                                        alt='delete'
                                                        width={16}
                                                        height={16}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <DeletePdfModal
                                            isDeletePdfModalOpen={isDeletePdfModalOpen}
                                            onClose={closeDeleteModal}
                                            pdfName={selectedPdf}
                                            fetchOptions={fetchOptionsPdfList}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyStateMessage}>
                                    <Image
                                        src={type === '/chatwithpdf' ? NO_RECORD : NO_HISTORY}
                                        alt='noRecord'
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.chatContainer}>
                <ToastContainer />
                <div className={styles.chatScreenContainer}>
                    <div className={styles.chatScreen}>
                        <div ref={messageListRef} className={styles.messageList}>
                            {chatMessages.map((message, index) => {
                                let icon;
                                let className;
                                if (message.type === 'apiMessage') {
                                    if (index === 0) {
                                        className = styles.firstMessage;
                                    } else {
                                        className = styles.apiMessage;
                                        icon = (
                                            <Image
                                                key={index}
                                                src={AI_AVATAR}
                                                alt='Me'
                                                className={styles.userIcon}
                                                priority
                                            />
                                        );
                                    }
                                } else {
                                    icon = (
                                        <Image
                                            key={index}
                                            src={USERICON_IMAGE}
                                            alt='Me'
                                            className={styles.userIcon}
                                            priority
                                        />
                                    );
                                    // The latest message sent by the user will be animated while waiting for a response
                                    className =
                                        loading && index === chatMessages.length - 1
                                            ? styles.userMessageWaiting
                                            : cx(styles.userMessage);
                                }
                                if (index !== 0 || chatMessages.length === 1) {
                                    return (
                                        <>
                                            <div key={`chatMessage-${index}`} className={className}>
                                                {icon}
                                                <div>
                                                    <div
                                                        className={
                                                            index === 0
                                                                ? ''
                                                                : index === 1 ||
                                                                  message.type === 'userMessage'
                                                                ? styles.userText
                                                                : styles.markDownAnswer
                                                        }
                                                    >
                                                        {message.type === 'apiMessage' &&
                                                        index !== 0 ? (
                                                            <Typing speed={20}>
                                                                {renderMessageContent(
                                                                    message.message,
                                                                )}
                                                            </Typing>
                                                        ) : (
                                                            message.message
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    </div>
                </div>
                <div className={styles.bottomContainer}>
                    <div className={styles.textContainer}>
                        <div className={styles.center}>
                            <div className={styles.cloudForm}>
                                <form>
                                    <textarea
                                        onKeyDown={handleEnter}
                                        ref={textAreaRef}
                                        rows={1}
                                        maxLength={512}
                                        id='userInput'
                                        name='userInput'
                                        placeholder={
                                            loading ? 'Waiting for response...' : 'Ask any question'
                                        }
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className={styles.textarea}
                                        disabled={loading}
                                    />
                                </form>
                            </div>
                        </div>
                        <button type='submit' disabled={loading} className={styles.generateButton}>
                            <div className={styles.submitButton} onClick={handleSubmit} aria-hidden>
                                {loading ? (
                                    <LoadingDots color='#FFF' style='large' />
                                ) : (
                                    <>
                                        <Image src={SUBMIT_ICON} alt='submit-icon' />
                                        <span>Submit</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                    <p className={styles.copyright}>
                        © 2024 Team AI-Gladiator. All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DesktopChat;
