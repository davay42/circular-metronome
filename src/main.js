import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "virtual:windi.css";
import { GesturePlugin } from "@vueuse/gesture";

const app = createApp(App);

app.use(router);

app.use(GesturePlugin);

app.mount("#app");
