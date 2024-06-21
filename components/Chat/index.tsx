import useWindowDimensions from '@/utils/useWindowDimensions';
import { WINDOW_SIZE } from '@/utils/windowSize';
import { useEffect, useState } from 'react';
import DesktopChat from './DesktopChat';
import MobileChat from './MobileChat';

const Chat = () => {
    const [windowWidth, setWindowWidth] = useState<number>(0);

    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        if (windowDimensions.width) {
            setWindowWidth(windowDimensions.width);
        }
    }, [windowDimensions]);

    return <>{windowWidth >= WINDOW_SIZE.DESKTOP ? <DesktopChat /> : <MobileChat />}</>;
};

export default Chat;
