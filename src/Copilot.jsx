import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export default function Copilot() {
  const [accessTokens, setAccessTokens] = useState("");
  const [chats, setChats] = useState([]);

  return (
    <div className="menu  menu-xs w-full h-full">
      <h1 className="menu-title">Github Copilot</h1>
      <div style={{ height: "calc(100% - 32px - 28px)" }}>
        <div class="chat chat-end">
          <div class="chat-bubble chat-bubble-secondary">Your Prompt</div>
        </div>
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-primary">Copilot Answer</div>
        </div>
      </div>
      <div className="max-w-full overflow-hidden">
        <div className="join">
          <input className="input input-sm join-item" placeholder="url" />
          <button className="btn btn-sm join-item btn-primary ">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
}
