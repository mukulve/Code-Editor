import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

export default function Copilot() {
  const [accessTokens, setAccessTokens] = useState("");
  const [chats, setChats] = useState([]);

  async function copilot() {
    try {
      let response = await invoke("copilot", {
        prompt: "folder",
        language: "javascript",
      });
      console.log(response);
    } catch (error) {
      console.error("Error invoking copilot:", error);
    }
  }

  useEffect(() => {
    copilot();
  }, []);

  return (
    <div className="menu  menu-xs w-full h-full">
      <h1 className="menu-title">Github Copilot</h1>
      <div style={{ height: "calc(100% - 32px - 28px)" }}>
        <div className="chat chat-end">
          <div className="chat-bubble chat-bubble-secondary">Your Prompt</div>
        </div>
        <div className="chat chat-start">
          <div className="chat-bubble chat-bubble-primary">Copilot Answer</div>
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
