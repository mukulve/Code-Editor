import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faComments,
  faEyeDropper,
  faFile,
  faGear,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

export default function SideTabs({ tabHandler }) {
  return (
    <aside className="w-fit bg-base-200 flex-none">
      <ul className="menu menu-xs bg-base-200 w-16 p-0 [&_li>*]: h-full">
        <li onClick={() => tabHandler(0)} className="p-2 ">
          <FontAwesomeIcon icon={faFile} className="text-xl" />
        </li>
        <li onClick={() => tabHandler(1)} className="p-2">
          <FontAwesomeIcon icon={faSearch} className="text-xl" />
        </li>
        <li onClick={() => tabHandler(2)} className="p-2">
          <FontAwesomeIcon icon={faCodeBranch} className="text-xl" />
        </li>
        <li onClick={() => tabHandler(3)} className="p-2">
          <FontAwesomeIcon icon={faGear} className="text-xl" />
        </li>
        <li onClick={() => tabHandler(4)} className="p-2">
          <FontAwesomeIcon icon={faComments} className="text-xl" />
        </li>
        <li
          onClick={() => document.getElementById("my_modal_2").showModal()}
          className="p-2"
        >
          <FontAwesomeIcon icon={faEyeDropper} className="text-xl" />
        </li>
      </ul>
    </aside>
  );
}
