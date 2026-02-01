import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue';
import ProductDetails from '../views/ProductDetailsView.vue';
import Basket from '../views/BasketView.vue';
import Checkout from '../views/CheckoutView.vue';
import Login from '../views/LoginView.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/product/:id', component: ProductDetails },
  { path: '/basket', component: Basket },
  { path: '/checkout', component: Checkout },
  { path: '/login', component: Login}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
