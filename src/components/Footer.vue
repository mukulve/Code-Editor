<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "../stores/editor";
const editor = useEditorStore();

defineProps<{
    cursor: number;
}>();


const path = computed(() => {
    let firstPart = editor.activeFile?.path.split("/").slice(0, -1).join("/") || "No directory";
    if (firstPart.length > 30) {
        firstPart = firstPart.slice(0, 30) + "...";
    }
    return firstPart + "/" + (editor.activeFile?.path.split("/").pop() || "");
});
</script>

<template>
    <footer>
        <span>{{ path }} | {{ cursor }}</span>
    </footer>
</template>

<style scoped>
footer {
    display: flex;
    align-items: center;
    height: 20px;
    background: var(--editor-background);
    color: var(--editor-foreground);
    overflow: hidden;
}
footer span {
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: xx-small;
}
</style>