import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import ProductDetails from '../views/ProductDetails.vue';
import Basket from '../views/Basket.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/product/:id', component: ProductDetails },
  { path: '/basket', component: Basket },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
