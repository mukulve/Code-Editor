import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { useThemeStore } from "./stores/theme";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const themeStore = useThemeStore();
themeStore.applyTheme();

app.mount("#app");
