<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog';
import { useEditorStore } from "../stores/editor";
import { invoke } from "@tauri-apps/api/core";

const editor = useEditorStore();

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

import {PhFiles, PhGear, PhGitBranch, PhMagnifyingGlass, PhPuzzlePiece, PhFolderOpen} from "@phosphor-icons/vue";
</script>

<template>
    <div class="nav">
        <button @click="changePage(0)"><PhFiles size="20"/></button>
        <button @click="changePage(1)"><PhMagnifyingGlass size="20"/></button>
        <button @click="changePage(2)"><PhGitBranch size="20"/></button>
        <button @click="changePage(3)"><PhPuzzlePiece size="20"/></button>
        <button @click="changePage(4)"><PhGear size="20"/></button>
        <button @click="changeWorkingDirectory"><PhFolderOpen size="20"/></button>
    </div>
</template>

<style scoped>
.nav {
    display: flex;
    flex-direction: column;
    flex: 0 0 40px;
    max-width: 40px;
    min-width: 40px;
    background: #1e1e1e;
    color: white;
    max-height: 100vh;
    overflow: hidden;
}
.nav button {
    background: #1e1e1e;
    border: none;
    color: white;
    padding: 10px;
    cursor: pointer;
}
.nav button:hover {
    background: #2d2d2d;
}
</style>
