<script setup lang="ts">
import File from './File.vue';

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

defineProps<{
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

import {PhCaretRight, PhCaretDown} from "@phosphor-icons/vue";
</script>

<template>
  <div class="folder-wrapper">
    <ContextMenuRoot>
      <ContextMenuTrigger as-child class="ContextMenuTrigger">
        <div class="flex" @click.stop="toggleFolder">
         <PhCaretRight v-if="!folderOpen"/>
         <PhCaretDown v-else/> 
          <img v-if="!folderOpen" src="../assets/icons/default_folder.svg" alt="folder icon" />
          <img v-else src="../assets/icons/default_folder_opened.svg" alt="folder icon" />
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
  color: white;
  font-size: 15px;
  user-select: none;
  width: 200px;
  height: fit-content;
  text-align: center;
  background-color: #1e1e1e;

  padding: 4px 8px;
}

.ContextMenuContent,
.ContextMenuSubContent {
  min-width: 220px;
  background-color: #1e1e1e;
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
  background-color: var(--grass-6);
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
  margin-left: 1rem;
}
</style>
