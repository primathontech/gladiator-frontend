/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import cx from 'classnames';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Typing from 'react-typing-animation';
import { toast, ToastContainer } from 'react-toastify';

import { Message, ClickOrPressEvent } from 'types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Document } from 'langchain/document';

import DOCUMENT_UPLOAD from '@public/Images/svgs/document-upload.svg';
import AI_AVATAR from '@public/Images/pngs/AIAvatar.png';
import NO_RECORD from '@public/Images/pngs/no-record.png';
import NO_HISTORY from '@public/Images/pngs/nohistory.png';

import REGENERATE from '@public/Images/svgs/regenerate.svg';
import SUBMIT_ICON from '@public/Images/svgs/submit.svg';
import USERICON_IMAGE from '@public/Images/pngs/usericon.png';
import HISTORY from '@public/Images/svgs/timer.svg';
import LoadingDots from '@components/ui/LoadingDots';
import ActiveOption from '@public/Images/svgs/active-option.svg';
import Delete from '@public/Images/svgs/delete.svg';
import InActiveOption from '@public/Images/svgs/inactive-option.svg';

import { Accordion, AccordionContent, AccordionItem } from '@components/ui/accordion';
import ShimmerUiContainer from '@components/ShimmerContainer';
import UploadPDFModal from '@/components/UploadPDFModal';
import { APP_URL, ApiRoute } from '@/components/appConstant';

import { useRouter } from 'next/router';
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
    const [isLoading, setIsLoading] = useState(false);
    const [previousUserText, setPreviousUserText] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const [chatHistory, setChatHistory] = useState([]);

    // Add a state to track whether the response has been received from the API
    const [responseReceived, setResponseReceived] = useState(false);
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
                        'Join millions of students, researchers and professionals to instantly answer questions and understand research with AI',
                    type: 'apiMessage',
                },
            ],
            pendingSourceDocs: [],
            pending: undefined,
        });
    };

    async function handleRegenerateSubmit(e: ClickOrPressEvent) {
        e.preventDefault();
        if (!previousUserText) {
            toast.error('Please input a question');
            setLoading(false);
            setResponseReceived(true);

            return;
        }

        setPreviousUserText(previousUserText.trim());
        setResponseReceived(true);
        const question = previousUserText.trim();

        setMessageState((state) => ({
            ...state,
            messages: state.messages.slice(0, -1),
            pending: undefined,
        }));

        setLoading(true);
        setQuery('');
        setMessageState((state) => ({ ...state, pending: '' }));

        const ctrl = new AbortController();

        try {
            fetchEventSource(`${APP_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    filename: selectedValue || `${selectedPdf}`,
                }),
                signal: ctrl.signal,
                onmessage: (event) => {
                    if (event.data === '[DONE]') {
                        setMessageState((state) => ({
                            messages: [
                                ...state.messages,
                                {
                                    type: 'apiMessage',
                                    message: state.pending ?? '',
                                    sourceDocs: state.pendingSourceDocs,
                                },
                            ],
                            pending: undefined,
                            pendingSourceDocs: undefined,
                        }));
                        setLoading(false);
                        ctrl.abort();
                    } else {
                        const data = JSON.parse(event.data);
                        if (data.sourceDocs) {
                            setMessageState((state) => ({
                                ...state,
                                pendingSourceDocs: data.sourceDocs,
                            }));
                        } else {
                            setMessageState((state) => ({
                                ...state,
                                pending: (state.pending ?? '') + data.data,
                            }));
                        }
                    }
                },
            });
        } catch (error) {
            setLoading(false);
            // setError("An error occurred while fetching the data. Please try again.");
        }
    }

    const handleRegenerate = (e: any) => {
        setResponseReceived(false);
        setLoading(true);
        setQuery(previousUserText);
        handleRegenerateSubmit(e);
    };

    // useEffect(() => {
    //     const fetchOptions = async () => {
    //         setIsLoading(true);
    //         try {
    //             const res = await fetch(`${APP_URL}/api/chat-history/${selectedCategory}`, {
    //                 method: 'GET',
    //             });

    //             if (res.status === 200) {
    //                 const options = await res.json();
    //                 setChatHistory(options);
    //             } else {
    //                 // Handle error
    //                 console.error('Failed to fetch chat history: ', res.statusText);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching options:', error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     fetchOptions();
    // }, [selectedCategory]);

    async function handleSubmit(e: ClickOrPressEvent) {
        e.preventDefault();

        if (!query) {
            toast.error('Please input a question');
            setLoading(false);
            setResponseReceived(true);

            return;
        }

        setPreviousUserText(query.trim());
        setResponseReceived(true);
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

        const reqBody = JSON.stringify(requestBody);

        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${APP_URL}${ApiRoute.CHAT_API}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: reqBody,
                });

                if (res.status === 200) {
                    const response = await res.json();
                    setMessageState((state) => ({
                        ...state,
                        messages: [
                            ...state.messages,
                            {
                                type: 'apiMessage',
                                message: response.answer.result,
                            },
                        ],
                    }));
                } else {
                    // Handle error
                }
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOptions();
    }

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

    useEffect(() => {
        const fetchOptions = async () => {
            setPdfLoading(true);
            try {
                const res = await fetch(`${APP_URL}/api/files`, {
                    method: 'GET',
                });
                if (res.status === 200) {
                    const options = await res.json();
                    // setCategory(options.category);
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
        fetchOptions();
    }, []);

    // scroll to bottom of chat
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
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

    const handleDelete = async (data: any) => {
        try {
            const res = await fetch(`${APP_URL}/api/files/${data}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.status === 200) {
                toast.success('Pdf File deleted successfully');
            } else {
                toast.error('Failed to delete');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
        setDropdownVisible(false);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftContainer}>
                <div className='flex justify-between items-center mb-10'>
                    <h1
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            paddingLeft: '20px',
                            color: 'white',
                        }}
                    >
                        AI-Gladiator
                    </h1>
                    <UploadPDFModal isOpen={isModalOpen} onClose={closeModal} />
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
                                        <div
                                            aria-controls='simple-menu'
                                            aria-haspopup='true'
                                            aria-hidden
                                            onClick={(e) => handleOptionClick(e, index)}
                                        >
                                            {dropdownVisible && dropdownIndex === index ? (
                                                <div className={styles.activeImage}>
                                                    <Image
                                                        src={ActiveOption}
                                                        alt='option'
                                                        width={20}
                                                    />
                                                </div>
                                            ) : (
                                                <div className={styles.inactiveImage}>
                                                    <Image
                                                        src={InActiveOption}
                                                        alt='option'
                                                        width={5}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {dropdownVisible && dropdownIndex === index && (
                                            <div className={styles.dropdownMenu}>
                                                {/* <div
                                                    onClick={() => handleEdit(index)}
                                                    className={styles.dropdownItem}
                                                    aria-hidden
                                                >
                                                    <Image
                                                        src={Edit}
                                                        alt='edit'
                                                        width={16}
                                                        height={16}
                                                    />
                                                    <span className={styles.editText}>Edit</span>
                                                </div> */}
                                                <div
                                                    onClick={() => {
                                                        handleDelete(data);
                                                    }}
                                                    className={styles.dropdownItem}
                                                    aria-hidden
                                                >
                                                    <Image
                                                        src={Delete}
                                                        alt='delete'
                                                        width={16}
                                                        height={16}
                                                    />
                                                    <span className={styles.deleteText}>
                                                        Delete
                                                    </span>
                                                </div>
                                            </div>
                                        )}
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
                    <div className={styles.chatHeaderContainer}>
                        {type === '/chatwithpdf' && (
                            <div>
                                <button
                                    onClick={openModal}
                                    className={styles.uploadButton}
                                    type='button'
                                >
                                    <Image src={DOCUMENT_UPLOAD} alt='pdf upload' />
                                    Upload Document
                                </button>
                            </div>
                        )}
                    </div>
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
                                                                {message.message}
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
                            <div className='p-5'>
                                {messageState.messages.map((msg, index) => (
                                    <div
                                        key={`SourceDocs-${index}`}
                                        className={`message ${msg.type}`}
                                    >
                                        <Accordion type='single' collapsible className='flex-col'>
                                            <AccordionItem value={msg.message}>
                                                <AccordionContent>
                                                    <ReactMarkdown linkTarget='_blank'>
                                                        {msg.message}
                                                    </ReactMarkdown>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {!loading && responseReceived && (
                        <button
                            type='button'
                            className={styles.regenrate}
                            onClick={handleRegenerate}
                        >
                            <Image src={REGENERATE} alt='Regen' width={14} height={14} />
                            Regenerate Response
                        </button>
                    )}
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
                                            loading ? 'Waiting for response...' : 'Send a Message'
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
                                {isLoading ? (
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
