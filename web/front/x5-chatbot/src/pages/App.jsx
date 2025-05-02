import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Привет! Чем могу помочь в вашем продуктовом магазине?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    const aiReply = {
      sender: "ai",
      text: `(Заглушка) Спасибо за ваш вопрос: '${input}'. Скоро я научусь отвечать!`,
    };
    setMessages([...messages, userMessage, aiReply]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 flex flex-col items-center">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h2 className="card-title">Чат с AI ассистентом</h2>
          <div className="h-96 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-bubble">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input input-bordered w-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Введите сообщение..."
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
