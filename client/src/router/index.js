import { createRouter, createWebHistory } from "vue-router";
import App from "../App.vue";

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "app",
            component: App,
            children: [
                {
                    path: "",
                    name: "home",
                    component: () => import("../components/HomePage.vue"),
                },
                {
                    path: "regulator",
                    name: "regulator",
                    component: () => import("../components/RegulatorPage.vue"),
                    props: (route) => ({ title: route.query.q }),
                },
                {
                    path: "seller",
                    name: "seller",
                    component: () => import("../components/SellerPage.vue"),
                    props: (route) => ({ title: route.query.q }),
                },
                {
                    path: "empty",
                    name: "empty",
                    component: () => import("../components/EmptyPage.vue"),
                    props: (route) => ({ title: route.query.q }),
                },
            ],
        },
    ],
});

export default router;
