import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/l7",
      name: "l7",
      component: () => import("../views/L7View.vue"),
    },
    {
      path: "/single",
      name: "single",
      component: () => import("../views/SingleLine.vue"),
    },
    {
      path: "/pos",
      name: "pos",
      component: () => import("../views/PositionView.vue"),
    },
    {
      path: "/test",
      name: "test",
      component: () => import("../views/Test.vue"),
    },
  ],
});

export default router;
