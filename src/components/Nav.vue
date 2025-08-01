<script setup lang="ts">
import { open } from "@tauri-apps/plugin-dialog";
import { useEditorStore } from "../stores/editor";
import { useThemeStore } from "../stores/theme";
import { invoke } from "@tauri-apps/api/core";

const editor = useEditorStore();
const theme = useThemeStore();

defineProps<{
    countRef: number;
}>();

const emit = defineEmits<{
    "update:countRef": [value: number];
}>();

function changePage(page: number) {
    emit("update:countRef", page);
}

async function changeWorkingDirectory() {
    const folder = await open({
        multiple: false,
        directory: true,
    });
    await invoke("change_directory", { path: folder });
    editor.setCurrentDirectory(folder as string);
}

function changeTheme() {
    const currentThemeIndex = theme.themes.findIndex(
        (t) => t.name === theme.currentTheme.name,
    );
    const nextThemeIndex = (currentThemeIndex + 1) % theme.themes.length;
    theme.setTheme(theme.themes[nextThemeIndex].name);
}

import {
    PhFiles,
    PhGear,
    PhGitBranch,
    PhMagnifyingGlass,
    PhPuzzlePiece,
    PhFolderOpen,
    PhRobot,
    PhPaintBrush,
} from "@phosphor-icons/vue";
</script>

<template>
    <div class="nav">
        <button @click="changePage(0)"><PhFiles size="20" /></button>
        <button @click="changePage(1)"><PhMagnifyingGlass size="20" /></button>
        <button @click="changePage(2)"><PhGitBranch size="20" /></button>
        <button @click="changePage(3)"><PhPuzzlePiece size="20" /></button>
        <button @click="changePage(4)"><PhGear size="20" /></button>
        <button @click="changePage(5)"><PhRobot size="20" /></button>
        <button @click="changeWorkingDirectory">
            <PhFolderOpen size="20" />
        </button>
        <button @click="changeTheme"><PhPaintBrush size="20" /></button>
    </div>
</template>

<style scoped>
.nav {
    display: flex;
    flex-direction: column;
    flex: 0 0 40px;
    max-width: 40px;
    min-width: 40px;
    background: var(--activityBar-background);
    color: var(--editor-foreground);
    max-height: 100vh;
    overflow: hidden;
}
.nav button {
    background: transparent;
    border: none;
    color: var(--editor-foreground);
    padding: 10px;
    cursor: pointer;
}
</style>
