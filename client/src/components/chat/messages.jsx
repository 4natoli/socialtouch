import React, { useState, useEffect, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroller';
import ChatContext from '../../context/chatContext';
import MessageBox from './messageBox';
import Loader from '../common/loader';
import { getMessages } from '../../services/chatService';

const ChatMessages = () => {
  const { room, incomingMessage } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isAll, setIsAll] = useState(false);
  const [scroll, setScroll] = useState(true);
  const messagesEndRef = useRef(null);
  let scrollableTargetRef;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoader(true);
        const loadedMessages = (await getMessages(room)).reverse();
        if (loadedMessages.length === 0 || loadedMessages.length < 20)
          setIsAll(true);
        setMessages(loadedMessages);
        setScroll(!scroll);
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setLoader(false);
      }
    };

    if (room) {
      fetchMessages();
      setIsAll(false);
    }
  }, [room]);

  useEffect(() => {
    if (incomingMessage) {
      setMessages([...messages, incomingMessage]);
      setScroll(!scroll);
    }
  }, [incomingMessage]);

  useEffect(() => {
    messagesEndRef.current.scrollIntoView();
  }, [scroll]);

  const loadMore = async () => {
    try {
      const newMessages = (await getMessages(room, messages.length)).reverse();

      if (newMessages.length === 0 || newMessages.length < 20) setIsAll(true);

      setMessages([...newMessages, ...messages]);
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div
      className="chat__messages"
      ref={(ref) => {
        scrollableTargetRef = ref;
      }}
    >
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        hasMore={!isAll}
        loader={
          <div className="post__box--load-more" key={Math.random()}>
            <Loader h100 size={5} />
          </div>
        }
        useWindow={false}
        getScrollParent={() => scrollableTargetRef}
        threshold={100}
        initialLoad={false}
        isReverse
      >
        {messages.length ? (
          messages.map((message) => (
            <MessageBox message={message} key={Math.random()} />
          ))
        ) : (
          <div className="centered h-100">{!loader ? 'No messages' : ''}</div>
        )}
      </InfiniteScroll>

      <div style={{ float: 'left', clear: 'both' }} ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
