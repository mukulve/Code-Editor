<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core';
import { onMounted, ref, watch } from 'vue';
import { useEditorStore } from "../stores/editor";
import File from './File.vue';

const editor = useEditorStore();
const gitChanges = ref<any[]>([]);

async function getGitChanges() {
    let changes:string[] =  await invoke("get_git_changes", {  });
    let files = []

    for (let i = 0; i < changes.length; i++) {
        let file =  {
            name: changes[i],
            path: changes[i],
            is_dir: false,
            children: null
        };
        files.push(file);
    }
    gitChanges.value = files
}

onMounted(async () => {
    await getGitChanges();
})


watch(
    () => editor.currentDirectoryPath,
    () => {
        getGitChanges();
    },
);


</script>

<template>
    <span>Commit</span>
    <input type="text" placeholder="Commit message..."/>
    <button>Commit</button>
    <span>Changes | {{ gitChanges.length }}</span>
    <div v-for="change in gitChanges" :key="change">
        <File :item="change" />
    </div>
</template>