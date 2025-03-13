import { useTowns, ConnectWallet } from '@towns/react-sdk';
import { useState, useEffect } from 'react';

// Function to check if text contains Cyrillic characters
const containsCyrillic = (text) => {
  return /[а-щА-щ]/g.test(text);
};

// Placeholder function for translation
const translateToEnglish = async (text) => {
  // In a real scenario, this would call a translation API
  return text;
};

function App() {
  const { createSpace, sendMessage, getMessages, isConnected, connect } = useTowns();
  const [spaceId, setSpaceId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [messageText, setMessageText] = useState('');

  if (!isConnected) {
    return <ConnectWallet onConnect={connect} />;
  }

  const handleCreateSpace = async () => {
    const newSpaceId = await createSpace(spaceName, spaceDescription);
    setSpaceId(newSpaceId);
    setSpaceName('');
    setSpaceDescription('');
  };

  const handleSendMessage = async () => {
    let textToSend = messageText;
    if (containsCyrillic(messageText)) {
      textToSend = await translateToEnglish(messageText);
    }
    await sendMessage(spaceId, textToSend);
    const msgs = await getMessages(spaceId);
    setMessages(msgs);
    setMessageText('');
  };

  useEffect(() => {
    if (spaceId) {
      const intervalId = window.setInterval(() => {
        sendMessage(spaceId, 'This is an automatic message.').then(() => {
          getMessages(spaceId).then(setMessages);
        });
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [spaceId]);

  return (
    <div>
      <h1>Создать новое пространство</h1>
      <form>
        <input
          type="text"
          placeholder="Название пространства"
          value={spaceName}
          onChange={e => setSpaceName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Описание пространства"
          value={spaceDescription}
          onChange={e => setSpaceDescription(e.target.value)}
        />
        <button onClick={handleCreateSpace}>Создать</button>
      </form>
      {spaceId && (
        <>
          <h1>Отправить сообщение в {spaceId}</h1>
          <form>
            <input
              type="text"
              placeholder="Сообщение"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
            />
            <button onClick={handleSendMessage}>Отправить</button>
          </form>
          <h1>Сообщения</h1>
          <ul>
            {messages.map(message => <li key={message.id}> {message.text} </li>)}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
