<script setup lang="ts">
import File from './File.vue';
import {folders} from "../folder.ts"

import {
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIndicator,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "reka-ui";
import { ref } from "vue";

const props = defineProps<{
  item: {
    name: string;
    path: string;
    is_dir: boolean;
    children?: any[] | null;
  };
}>();

const checkboxOne = ref(false);
const checkboxTwo = ref(false);
const person = ref("pedro");
const folderOpen = ref(false);

function handleClick() {
  alert("hello!");
}

function toggleFolder() {
  folderOpen.value = !folderOpen.value;
}

function getIcon() {
  for (let i = 0; i < folders.supported.length; i++) {
    if (folders.supported[i].extensions.includes(props.item.name)) {
      return "folder_type_" + folders.supported[i].icon + ".svg";
    }
  }

  return "default_folder.svg";
}

function getIconUrl(fileName: string) {
  let url = new URL(`../assets/icons/${fileName}`, import.meta.url).href;
  if (url.includes("undefined")) {
    return new URL(`../assets/icons/default_folder.svg`, import.meta.url).href;
  }
  return new URL(`../assets/icons/${fileName}`, import.meta.url).href;
}


import {PhCaretRight, PhCaretDown} from "@phosphor-icons/vue";
</script>

<template>
  <div class="folder-wrapper">
    <ContextMenuRoot>
      <ContextMenuTrigger as-child class="ContextMenuTrigger">
        <div class="flex" @click.stop="toggleFolder">
         <PhCaretRight v-if="!folderOpen"/>
         <PhCaretDown v-else/> 
          <img :src="getIconUrl(getIcon())" alt="file icon" />
          <span>{{ item.name }}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent class="ContextMenuContent" :side-offset="5">
          <ContextMenuItem
            value="New Tab"
            class="ContextMenuItem"
            @click="handleClick"
          >
            New File
            <div class="RightSlot">⌘+T</div>
          </ContextMenuItem>
          <ContextMenuItem
            value="New Tab"
            class="ContextMenuItem"
            @click="handleClick"
          >
            New Folder
            <div class="RightSlot">⌘+T</div>
          </ContextMenuItem>
           <ContextMenuSeparator class="ContextMenuSeparator" />
          <ContextMenuItem
            value="New Tab"
            class="ContextMenuItem"
            @click="handleClick"
          >
            Delete
            <div class="RightSlot">⌘+T</div>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger
              value="more toolsz"
              class="ContextMenuSubTrigger"
            >
              More
              <div class="RightSlot">Icon</div>
            </ContextMenuSubTrigger>
            <ContextMenuPortal>
              <ContextMenuSubContent
                class="ContextMenuSubContent"
                :side-offset="2"
                :align-offset="-5"
              >
                <ContextMenuItem class="ContextMenuItem">
                  Save Page As…
                  <div class="RightSlot">⌘+S</div>
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuPortal>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenuRoot>
    <div class="children" v-if="item.children && item.children.length && folderOpen" >
      <div v-for="child in item.children" :key="child.path">
        <Folder v-if="child.is_dir" :item="child" />
        <File v-else :item="child" />
      </div>
    </div>
  </div>
</template>

<style>
.flex {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flex img {
  width: 16px;
  height: 16px;
}

.ContextMenuTrigger {
  color: var(--editor-foreground);
  font-size: 15px;
  user-select: none;
  width: 200px;
  height: fit-content;
  text-align: center;
  background-color: var(--editor-background);

  padding: 4px 8px;
}

.ContextMenuContent,
.ContextMenuSubContent {
  min-width: 220px;
  background-color: var(--editor-background);
  color: white;
  z-index: 1000;
  border-radius: 6px;
  overflow: hidden;
  padding: 5px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
}

.ContextMenuItem,
.ContextMenuCheckboxItem,
.ContextMenuRadioItem,
.ContextMenuSubTrigger {
  font-size: 13px;
  line-height: 1;
  color: var(--grass-11);
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 25px;
  padding: 0 5px;
  position: relative;
  padding-left: 25px;
  user-select: none;
  outline: none;
}
.ContextMenuSubTrigger[data-state="open"] {
  background-color: var(--grass-4);
  color: var(--grass-11);
}
.ContextMenuItem[data-disabled],
.ContextMenuCheckboxItem[data-disabled],
.ContextMenuRadioItem[data-disabled],
.ContextMenuSubTrigger[data-disabled] {
  color: var(--mauve-8);
  pointer-events: "none";
}
.ContextMenuItem[data-highlighted],
.ContextMenuCheckboxItem[data-highlighted],
.ContextMenuRadioItem[data-highlighted],
.ContextMenuSubTrigger[data-highlighted] {
  background-color: var(--grass-9);
  color: var(--grass-1);
}

.ContextMenuLabel {
  padding-left: 25px;
  font-size: 12px;
  line-height: 25px;
  color: var(--mauve-11);
}

.ContextMenuSeparator {
  height: 1px;
  background-color: #9cdcfe;
  margin: 5px;
}

.ContextMenuItemIndicator {
  position: absolute;
  left: 0;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.RightSlot {
  margin-left: auto;
  padding-left: 20px;
  color: var(--mauve-11);
}
[data-highlighted] > .RightSlot {
  color: white;
}
[data-disabled] .RightSlot {
  color: var(--mauve-8);
}

.children {
  margin-left: 0.5rem;
}
</style>
