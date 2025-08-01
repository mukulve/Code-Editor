<script setup lang="ts">
import Folder from './Folder.vue';
import {languages} from "../icon.ts"
import { invoke } from "@tauri-apps/api/core";

function getIcon(path: string) {
  let extension = path.split('.').pop();
  for (const [_, value] of Object.entries(languages)) {
    if (extension == value.defaultExtension) {
      return "file_type_" + value.ids + ".svg";
    }
  }

  return "default_file.svg";
}

function getIconUrl(fileName: string) {
  let url = new URL(`../assets/icons/${fileName}`, import.meta.url).href;
  if (url.includes("undefined")) {
    return new URL(`../assets/icons/default_file.svg`, import.meta.url).href;
  }
  return new URL(`../assets/icons/${fileName}`, import.meta.url).href;
}

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

function handleClick() {
  alert("hello!");
}

import { useEditorStore } from '../stores/editor'

const editor = useEditorStore()

async function openFile() {
  const result: string = await invoke("read_file_content", { path: props.item.path });
  editor.openFile({
    name: props.item.name,
    path: props.item.path,
    content: result,
  });
}
</script>

<template>
  <div class="folder-wrapper">

    <ContextMenuRoot>
      <ContextMenuTrigger as-child class="ContextMenuTrigger">
        <div class="flex" @click="openFile">
          <img  :src="getIconUrl(getIcon(item.path))" alt="file icon" />
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
            New Tab
            <div class="RightSlot">⌘+T</div>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger
              value="more toolsz"
              class="ContextMenuSubTrigger"
            >
              More Tools
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
                <ContextMenuItem class="ContextMenuItem">
                  Create Shortcut…
                </ContextMenuItem>
                <ContextMenuItem class="ContextMenuItem">
                  Name Window…
                </ContextMenuItem>
                <ContextMenuSeparator class="ContextMenuSeparator" />
                <ContextMenuItem class="ContextMenuItem">
                  Developer Tools
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuPortal>
          </ContextMenuSub>
          <ContextMenuItem value="New Window" class="ContextMenuItem">
            New Window
            <div class="RightSlot">⌘+N</div>
          </ContextMenuItem>
          <ContextMenuItem
            value="New Private Window"
            class="ContextMenuItem"
            disabled
          >
            New Private Window
            <div class="RightSlot">⇧+⌘+N</div>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger
              value="more tools"
              class="ContextMenuSubTrigger"
            >
              More Tools
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
                <ContextMenuItem class="ContextMenuItem">
                  Create Shortcut…
                </ContextMenuItem>
                <ContextMenuItem class="ContextMenuItem">
                  Name Window…
                </ContextMenuItem>
                <ContextMenuSeparator class="ContextMenuSeparator" />
                <ContextMenuItem class="ContextMenuItem">
                  Developer Tools
                </ContextMenuItem>
                <ContextMenuSub>
                  <ContextMenuSubTrigger
                    value="more toolsz"
                    class="ContextMenuSubTrigger"
                  >
                    More Tools
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
                      <ContextMenuItem class="ContextMenuItem">
                        Create Shortcut…
                      </ContextMenuItem>
                      <ContextMenuItem class="ContextMenuItem">
                        Name Window…
                      </ContextMenuItem>
                      <ContextMenuSeparator class="ContextMenuSeparator" />
                      <ContextMenuItem class="ContextMenuItem">
                        Developer Tools
                      </ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger
                          value="more toolsz"
                          class="ContextMenuSubTrigger"
                        >
                          More Tools
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
                            <ContextMenuItem class="ContextMenuItem">
                              Create Shortcut…
                            </ContextMenuItem>
                            <ContextMenuItem class="ContextMenuItem">
                              Name Window…
                            </ContextMenuItem>
                            <ContextMenuSeparator class="ContextMenuSeparator" />
                            <ContextMenuItem class="ContextMenuItem">
                              Developer Tools
                            </ContextMenuItem>
                          </ContextMenuSubContent>
                        </ContextMenuPortal>
                      </ContextMenuSub>
                    </ContextMenuSubContent>
                  </ContextMenuPortal>
                </ContextMenuSub>
                <ContextMenuItem class="ContextMenuItem">
                  Developer Tools
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuPortal>
          </ContextMenuSub>
          <ContextMenuSeparator class="ContextMenuSeparator" />
          <ContextMenuCheckboxItem v-model="checkboxOne" class="ContextMenuItem">
            <ContextMenuItemIndicator class="ContextMenuItemIndicator">
              Icon
            </ContextMenuItemIndicator>
            Show Bookmarks
            <div class="RightSlot">⌘+B</div>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem v-model="checkboxTwo" class="ContextMenuItem">
            <ContextMenuItemIndicator class="ContextMenuItemIndicator">
              Icon
            </ContextMenuItemIndicator>
            Show Full URLs
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator class="ContextMenuSeparator" />
          <ContextMenuLabel class="ContextMenuLabel"> People </ContextMenuLabel>
          <ContextMenuRadioGroup v-model="person">
            <ContextMenuRadioItem class="ContextMenuItem" value="pedro">
              <ContextMenuItemIndicator class="ContextMenuItemIndicator">
                Icon
              </ContextMenuItemIndicator>
              Pedro Duarte
            </ContextMenuRadioItem>
            <ContextMenuRadioItem class="ContextMenuItem" value="colm">
              <ContextMenuItemIndicator class="ContextMenuItemIndicator">
                Icon
              </ContextMenuItemIndicator>
              Colm Tuite
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenuRoot>
    <div class="children" v-if="item.children && item.children.length">
      <div v-for="child in item.children" :key="child.path">
        <Folder v-if="child.is_dir" :item="child" />
        <File v-else :item="child" />
      </div>
    </div>
  </div>
</template>
