import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

export default function Copilot() {
  const [accessTokens, setAccessTokens] = useState("");
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");

  async function copilot() {
    if (message == "") return;

    setChats((oldArray) => [...oldArray, { message: message, sender: "user" }]);
    let response = await invoke("copilot", {
      prompt: `${message}\n\n`,
      language: "",
    });
    setChats((oldArray) => [
      ...oldArray,
      { message: response, sender: "copilot" },
    ]);
  }

  useEffect(() => {
    copilot();
  }, []);

  useEffect(() => {
    const unlisten = listen("copilot-event", (e) => {
      setChats((oldArray) => [
        ...oldArray,
        { message: e.payload, sender: "copilot" },
      ]);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <div className="menu  menu-xs w-full h-full">
      <h1 className="menu-title">Github Copilot</h1>
      <div
        style={{ height: "calc(100% - 32px - 28px)" }}
        className="overflow-scroll"
      >
        {chats.map((chat, index) => (
          <div
            className={`${
              chat.sender == "user" ? "chat-end" : "chat-start"
            } chat`}
          >
            <div
              className={`${
                chat.sender == "user"
                  ? "chat-bubble-primary"
                  : "chat-bubble-secondary"
              } chat-bubble break-all`}
            >
              {chat.message}
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-full overflow-hidden">
        <div className="join">
          <input
            className="input input-sm join-item"
            placeholder="Ask Copilot..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="btn btn-sm join-item btn-primary "
            onClick={copilot}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
}
