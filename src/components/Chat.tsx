import { useChat } from "@livekit/components-react";

const ChatComponent = () => {
  const { chatMessages, send, isSending } = useChat();
  console.log(isSending);

  return (
    <div>
      {chatMessages.map((msg) => (
        <div key={msg.timestamp}>
          {msg.from?.identity}: {msg.message}
        </div>
      ))}
      <button disabled={isSending} onClick={() => send("hi my name is jake")}>
        Send Message
      </button>
    </div>
  );
};

export default ChatComponent;
