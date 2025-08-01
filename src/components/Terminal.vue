<template>
  <div ref="terminalContainer" class="terminal"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

const terminalContainer = ref();
let term: Terminal;

onMounted(async () => {
  term = new Terminal({ cols: 100, rows: 10 , theme: { background: '#000', foreground: '#fff' }});
  term.open(terminalContainer.value);

  // Start backend PTY
  await invoke("start_terminal");

  term.write("-- Terminal --\n");

  // Listen for output
  listen("terminal-output", (event) => {
    term.write(event.payload as string);
  });

  // Send input to backend
  term.onData((data) => {
    invoke("write_to_terminal", { input: data });
  });

});
</script>

<style>
.terminal {
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
}
</style>