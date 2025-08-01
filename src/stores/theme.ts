import { defineStore } from "pinia";
import { dark } from "../themes/dark";
import { light } from "../themes/light";
import { dracula } from "../themes/dracula";
import { monokai } from "../themes/monokai";
import { solarizedLight } from "../themes/solarized-light";
import { solarizedDark } from "../themes/solarized-dark";
import { nord } from "../themes/nord";
import { oneDarkPro } from "../themes/one-dark-pro";
import { gruvboxDark } from "../themes/gruv-box-dark";
import { palenight } from "../themes/pale-night";
import { ayuDark } from "../themes/ayu-dark";
import { nightOwl } from "../themes/night-owl";
import { tokyoNight } from "../themes/tokyo-night";
import { tomorrowNight } from "../themes/tomorrow-night";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    currentTheme: dark,
    themes: [
      dark,
      light,
      dracula,
      monokai,
      solarizedLight,
      solarizedDark,
      nord,
      oneDarkPro,
      gruvboxDark,
      palenight,
      ayuDark,
      nightOwl,
      tokyoNight,
      tomorrowNight
    ],
  }),
  actions: {
    setTheme(themeName: string) {
      const theme = this.themes.find((t) => t.name === themeName);
      if (theme) {
        this.currentTheme = theme;
        this.applyTheme();
      }
    },
    applyTheme() {
      const root = document.documentElement;
      for (const [key, value] of Object.entries(this.currentTheme.colors)) {
        root.style.setProperty(`--${key.replace(/\./g, "-")}`, value);
      }
    },
  },
});
