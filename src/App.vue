<script setup lang="ts">
import Nav from "./components/Nav.vue";
import { ref, onMounted, nextTick } from "vue";
import { invoke } from "@tauri-apps/api/core";
import Folder from "./components/Folder.vue";
import File from "./components/File.vue";
import Footer from "./components/Footer.vue";
import "./main.css";
import { useEditorStore } from "./stores/editor";
import { watch } from "vue";
import { languages } from "./icon";
import { debounce } from 'lodash'

import { onUnmounted } from 'vue'
import { PhX, PhArrowDown, PhArrowUp } from "@phosphor-icons/vue";
import Terminal from "./components/Terminal.vue";


const editor = useEditorStore();
const highlightedHtml = ref("");
const directoryTree = ref<any[]>([]);
const currentFolder = ref("");
const searchResults = ref<any[]>([]);
const fileSearchPopUpVisible = ref(false);
const findQuery = ref("");
const showFind = ref(false);
const findMatches = ref<number[]>([]);
const currentMatchIndex = ref(0);
const page = ref(0);
const codeInput = ref<HTMLTextAreaElement | null>(null)
const cursorPosition = ref(0)
const suggestions = ref<string[]>([])
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(0)
const suggestionBoxStyle = ref({ top: "0px", left: "0px" })
const staticCompletions = ["fn", "let", "mut", "main", "String", "println!", "Result", "Ok", "Err"]

//On mount 
onMounted(() => {
    window.addEventListener("keydown", handleFindShortcut);
    window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    window.removeEventListener("keydown", handleFindShortcut);
    window.removeEventListener('keydown', handleKeyDown)
})

onMounted(async () => {
    await nextTick();
    const input = document.querySelector(".input-area") as HTMLTextAreaElement;
    const pre = document.querySelector(".highlighted-area") as HTMLPreElement;

    if (input && pre) {
        const syncScroll = () => {
            pre.scrollTop = input.scrollTop;
            pre.scrollLeft = input.scrollLeft;
        };

        input.addEventListener("scroll", syncScroll);
        input.addEventListener("wheel", syncScroll, { passive: true });

        input.addEventListener("input", () => {
            setTimeout(syncScroll, 0);
        });
    }
});

//Debounce
const searchFilesByNameDebounce = debounce((query: string) => {
    searchFilesByName(query);
}, 300)

const findMatchesInFileDebounce = debounce(() => {
    updateFindMatches();
}, 300)

const searchDirectoryTreeDebounce = debounce((query: string) => {
    searchDirectoryTree(query);
}, 300)

//keyboard shortcuts
window.addEventListener("keydown", (event) => {
    if (!showSuggestions.value) return;

    if (event.key === "ArrowDown") {
        event.preventDefault()
        selectedSuggestionIndex.value = (selectedSuggestionIndex.value + 1) % suggestions.value.length
    }

    if (event.key === "ArrowUp") {
        event.preventDefault()
        selectedSuggestionIndex.value = (selectedSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length
    }

    if (event.key === "Enter") {
        event.preventDefault()
        applySuggestion(suggestions.value[selectedSuggestionIndex.value])
    }

    if (event.key === "Escape") {
        showSuggestions.value = false
    }
})

function handleFindShortcut(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        event.preventDefault();
        showFind.value = true;
        nextTick(() => {
            const input = document.querySelector(".find-input") as HTMLInputElement;
            input?.focus();
        });
    }
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.metaKey && event.key.toLowerCase() === 'p') {
        event.preventDefault()
        console.log('Meta + P was pressed!')
        fileSearchPopUpVisible.value = !fileSearchPopUpVisible.value;
    }
}

//invokes
async function searchDirectoryTree(query: string) {
    if (!query.trim()) {
        console.log("Empty search query, skipping.");
        return;
    }

    if (query.length < 3) return;

    let results: any = await invoke("search_files", { query: query });
    searchResults.value = results;
}

async function searchFilesByName(query: string) {
    if (!query.trim()) {
        console.log("Empty search query, skipping.");
        return;
    }

    if (query.length < 3) return;

    let results: any = await invoke("search_files_by_name", { query: query });
    searchResults.value = results;
}

async function getDirectoryTree() {
    let tree: any = await invoke("get_directory_tree", {});
    currentFolder.value = tree.name;
    directoryTree.value = tree.children as any[];
}

//watches 

watch(
    () => editor.activeFile?.path,
    () => {
        highlightCode();
    },
);

watch(
    () => editor.currentDirectoryPath,
    (newPath) => {
        console.log("Current directory changed to: " + newPath);
        getDirectoryTree();
    },
);

async function highlightCode() {
  const language = getLanguage(editor.activeFile?.path || "");
  const code = editor.activeFileContent;

  const result:string = await invoke("highlight_html", {
    code,
    language,
    matches: findMatches.value,
    queryLen: findQuery.value.length,
    path: editor.activeFile?.path
  });

  highlightedHtml.value = result;
}

//helpers
function getLanguage(path: string) {
    let extension = path.split(".").pop();
    for (const [, value] of Object.entries(languages)) {
        if (extension == value.defaultExtension) {
            return value.ids;
        }
    }

    return "";
}


getDirectoryTree();

function updateCursor() {
    const textarea = codeInput.value
    if (textarea) {
        cursorPosition.value = textarea.selectionStart

        const text = editor.activeFileContent.slice(0, cursorPosition.value)
        const lastWord = text.split(/\s+/).pop() || ""

        if (lastWord.length > 0) {
            suggestions.value = staticCompletions.filter(s =>
                s.startsWith(lastWord)
            ).slice(0, 5)

            if (suggestions.value.length > 0) {
                showSuggestions.value = true
                selectedSuggestionIndex.value = 0

                const lines = text.slice(0, cursorPosition.value).split("\n")
                const lineHeight = 21
                suggestionBoxStyle.value = {
                    top: `${lines.length * lineHeight}px`,
                    left: `${lines[lines.length - 1].length * 8}px`,
                }
            } else {
                showSuggestions.value = false
            }
        } else {
            showSuggestions.value = false
        }
    }
}


function applySuggestion(suggestion: string) {
    const textarea = codeInput.value
    if (!textarea) return;

    const before = editor.activeFileContent.slice(0, cursorPosition.value)
    const after = editor.activeFileContent.slice(cursorPosition.value)

    const lastWordMatch = before.match(/(\w+)$/)
    const lastWord = lastWordMatch ? lastWordMatch[1] : ""

    const newCursor = cursorPosition.value - lastWord.length + suggestion.length
    editor.activeFileContent = before.slice(0, -lastWord.length) + suggestion + after

    nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursor
        textarea.focus()
        cursorPosition.value = newCursor
        showSuggestions.value = false
        highlightCode()
    })
}

async function updateFindMatches() {
  currentMatchIndex.value = 0;

  if (!findQuery.value.trim()) {
    findMatches.value = [];
    highlightCode();
    return;
  }

  const results: number[] = await invoke("find_matches_in_file", {
    content: editor.activeFileContent,
    query: findQuery.value,
  });
  findMatches.value = results;
  highlightCode();
}

function goToNextMatch(reverse = false) {
    if (findMatches.value.length === 0) return;

    if (reverse) {
        currentMatchIndex.value = (currentMatchIndex.value - 1 + findMatches.value.length) % findMatches.value.length;
    } else {
        currentMatchIndex.value = (currentMatchIndex.value + 1) % findMatches.value.length;
    }

    const matchPos = findMatches.value[currentMatchIndex.value];
    codeInput.value!.selectionStart = matchPos;
    codeInput.value!.selectionEnd = matchPos + findQuery.value.length;
    codeInput.value!.focus();
}
</script>

<template>
    <main>
        <div class="nav">
            <Nav v-model:count-ref="page" />
        </div>
        <div class="directoryTree" v-if="page === 0">
            <span>{{ currentFolder }}</span>
            <div v-for="item in directoryTree" :key="item.path">
                <Folder v-if="item.is_dir" :item="item" />
                <File v-else :item="item" />
            </div>
        </div>
        <div class="directoryTree" v-if="page === 1">
            <span>Search</span>
            <input type="text" placeholder="Search files..."
                @input="searchDirectoryTreeDebounce(($event.target as HTMLInputElement).value || '')"
                class="search-input" spellcheck="false" autocomplete="off" autocorrect="off"
                autocapitalize="off"></input>
            <File v-for="file in searchResults" :key="file.path" :item="file" />
        </div>
        <div class="directoryTree" v-if="page === 2">
            <span>Git</span>
        </div>
        <div class="directoryTree" v-if="page === 3">
            <span>Extensions</span>
        </div>
        <div class="directoryTree" v-if="page === 4">
            <span>Settings</span>
        </div>
        <div class="editor" >
            <div class="editor-header">
                <div v-for="file in editor.openFiles" :key="file.path">
                    <div class="file-tab">
                        <button @click="editor.openFile(file)">
                            {{ file.name }}
                        </button>
                        <button @click="editor.closeFile(file)">
                            <PhX class="close-icon" />
                        </button>
                    </div>
                </div>
            </div>
            <div class="editor-container">
                <textarea ref="codeInput" @click="updateCursor" @keyup="updateCursor" v-model="editor.activeFileContent"
                    @input="highlightCode" class="input-area" spellcheck="false" wrap="off" autocomplete="off"
                    autocorrect="off" autocapitalize="off" />
                <div v-if="showFind" class="find-bar">
                    <input class="find-input" v-model="findQuery" @input="findMatchesInFileDebounce" placeholder="Find..." />
                    <button @click="goToNextMatch(false)"><PhArrowDown/></button>
                    <button @click="goToNextMatch(true)"><PhArrowUp/></button>
                    <button @click="showFind = false"><PhX/></button>
                </div>
                <ul v-if="showSuggestions" class="suggestion-box" :style="suggestionBoxStyle">
                    <li v-for="(item, i) in suggestions" :key="item" :class="{ active: i === selectedSuggestionIndex }"
                        @mousedown.prevent="applySuggestion(item)">
                        {{ item }}
                    </li>
                </ul>
                <pre class="highlighted-area" v-html="highlightedHtml"></pre>
            </div>
            <div class="terminal">
                <Terminal/>
            </div>
        </div>
    </main>
    <div v-if="fileSearchPopUpVisible" class="modal-overlay" @click.self="fileSearchPopUpVisible = false">
        <div class="modal">
            <input type="text" placeholder="Search files..."
                @input="searchFilesByNameDebounce(($event.target as HTMLInputElement).value || '')"
                class="modal-search-input" spellcheck="false" autocomplete="off" autocorrect="off"
                autocapitalize="off" />
            <div class="modal-results">
                <File v-for="file in searchResults" :key="file.path" :item="file" />
            </div>
        </div>
    </div>
    <Footer :cursor="cursorPosition" />
</template>

<style>
.find-bar {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #2d2d2d;
    border: 1px solid #444;
    padding: 5px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    z-index: 20;
    gap: 5px;
}

.find-bar input {
    background: #1e1e1e;
    border: 1px solid #555;
    color: white;
    padding: 2px 6px;
    width: 140px;
    font-size: 14px;
}

.find-bar button {
    background: #444;
    color: white;
    border: none;
    padding: 2px 6px;
    cursor: pointer;
    border-radius: 3px;
}

.find-bar button:hover {
    background: #555;
}

.suggestion-box {
    position: absolute;
    background: #1e1e1e;
    border: 1px solid #444;
    color: white;
    list-style: none;
    padding: 4px 0;
    margin: 0;
    font-family: monospace;
    font-size: 14px;
    z-index: 10;
    width: 200px;
    max-height: 150px;
    overflow-y: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.suggestion-box li {
    padding: 4px 10px;
    cursor: pointer;
}

.suggestion-box li.active,
.suggestion-box li:hover {
    background: #373737;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: start;
    padding-top: 100px;
    z-index: 999;
}

.modal {
    background: #1e1e1e;
    border: 1px solid #333;
    padding: 20px;
    border-radius: 8px;
    width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.modal-search-input {
    width: 100%;
    font-size: 16px;
    background: #2d2d2d;
    border: 1px solid #444;
    color: white;
    border-radius: 4px;
    margin-bottom: 10px;
}

.modal-results {
    max-height: 400px;
    overflow-y: auto;
}

.directoryTree {
  display: flex;
  flex-direction: column;
  flex: 0 0 200px;
  max-width: 200px;
  min-width: 200px;
  height: calc(100vh - 20px);
  background: #1e1e1e;
  overflow: auto;
}

.directoryTree span {
    font-size: smaller;
}

main {
    display: flex;
}

.editor-header {
    display: flex;
    gap: 10px;
    align-items: center;
    background: #333;
    color: white;
    height: 30px;
}

.editor-header button {
    background: transparent;
    border: none;
    color: white;
    padding: 5px 10px;
    cursor: pointer;
}

.editor-header button:hover {
    background: #444;
}

.editor-header button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(173, 214, 255, 0.3);
}

.editor-header button:active {
    background: #555;
}

.editor-header button:disabled {
    color: #888;
    cursor: not-allowed;
}

.editor-header button:disabled:hover {
    background: transparent;
}

.editor-header button:disabled:focus {
    box-shadow: none;
}

.editor-header button:disabled:active {
    background: transparent;
}

.editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #252526;
    color: white;
}

.editor-container {
    position: relative;
    width: 100%;
    height: calc(100vh - 20px - 30px - 200px);
    background: #1e1e1e;
    color: white;
    border: 1px solid #333;
    overflow: hidden;
}

.terminal {
    height: 200px;
    width: 100%;
    z-index: 3;
    background: #1e1e1e;
    border-top: 1px solid #333;
}

/* Shared font properties to ensure identical rendering */
.input-area,
.highlighted-area {
    font-family:
        "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro",
        "Menlo", "Consolas", monospace;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0;
    word-spacing: normal;
    tab-size: 2;
    -moz-tab-size: 2;
    font-variant-ligatures: none;
    font-feature-settings: normal;
}

/* The highlighted code (behind textarea) */
.highlighted-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 8px;
    border: none;
    pointer-events: none;
    white-space: pre;
    word-wrap: normal;
    word-break: normal;
    overflow: auto;
    color: white;
    z-index: 1;
    background: transparent;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}

/* The editable layer (on top) */
.input-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 8px;
    border: none;
    resize: none;
    outline: none;
    background: transparent;
    color: transparent;
    caret-color: #ffffff;
    z-index: 2;
    overflow: auto;
    white-space: pre;
    word-wrap: normal;
    word-break: normal;
    box-sizing: border-box;
    text-rendering: optimizeSpeed;
}

/* Empty line helper - invisible but takes up space */
.empty-line {
    color: transparent;
    font-size: 0;
    line-height: 1.5;
    display: inline;
}

/* Selection styling for the textarea */
.input-area::selection {
    background: rgba(173, 214, 255, 0.3);
    color: transparent;
}

.input-area::-moz-selection {
    background: rgba(173, 214, 255, 0.3);
    color: transparent;
}

/* Ensure consistent scrollbars */
.input-area::-webkit-scrollbar,
.highlighted-area::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

.input-area::-webkit-scrollbar-track,
.highlighted-area::-webkit-scrollbar-track {
    background: #252526;
}

.input-area::-webkit-scrollbar-thumb,
.highlighted-area::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 4px;
}

.input-area::-webkit-scrollbar-thumb:hover,
.highlighted-area::-webkit-scrollbar-thumb:hover {
    background: #4f4f4f;
}

.input-area::-webkit-scrollbar-corner,
.highlighted-area::-webkit-scrollbar-corner {
    background: #252526;
}
</style>
