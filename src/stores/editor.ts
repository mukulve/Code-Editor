import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useEditorStore = defineStore("editor", () => {
  // State
  const openFiles = ref<
    Array<{ path: string; name: string; content: string; unsaved: boolean }>
  >([]);
  const activeFilePath = ref("");
  const currentDirectory = ref("");

  // Getters
  const activeFile = computed(() => {
    return openFiles.value.find((f) => f.path === activeFilePath.value);
  });

  const currentDirectoryPath = computed(() => {
    return currentDirectory.value;
  });

  const activeFileContent = computed({
    get: () => {
      return (
        openFiles.value.find((f) => f.path === activeFilePath.value)?.content ||
        ""
      );
    },
    set: (newContent: string) => {
      if (activeFilePath.value) {
        updateFileContent(activeFilePath.value, newContent);
      }
    },
  });

  // Actions
  function openFile(file: { path: string; name: string; content: string }) {
    const exists = openFiles.value.find((f) => f.path === file.path);
    if (!exists) openFiles.value.push({ ...file, unsaved: false });
    activeFilePath.value = file.path;
  }

  function setCurrentDirectory(path: string) {
    currentDirectory.value = path;
  }

  function closeFile(file: { path: string; name: string; content: string }) {
    openFiles.value = openFiles.value.filter((f) => f.path !== file.path);
    if (activeFilePath.value === file.path) {
      activeFilePath.value = openFiles.value[0]?.path ?? "";
    }
  }

  function updateFileContent(path: string, newContent: string) {
    const file = openFiles.value.find((f) => f.path === path);
    if (file) {
      file.content = newContent;
      file.unsaved = true;
    }
  }

  function markFileSaved(path: string) {
    const file = openFiles.value.find((f) => f.path === path);
    if (file) file.unsaved = false;
  }

  return {
    openFiles,
    activeFilePath,
    activeFile,
    activeFileContent,
    currentDirectoryPath,
    openFile,
    closeFile,
    updateFileContent,
    markFileSaved,
    setCurrentDirectory
  };
});
