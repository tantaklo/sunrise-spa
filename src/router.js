import Vue from 'vue';
import Router from 'vue-router';
import gql from 'graphql-tag';
import store from './store';
import apollo from './apollo';
import TheHeader from './components/header/TheHeader.vue';
import TheFooter from './components/footer/TheFooter.vue';
import TheCheckoutHeader from './components/header/TheCheckoutHeader.vue';
import TheCheckoutFooter from './components/footer/TheCheckoutFooter.vue';
import PageHome from './components/home/PageHome.vue';
import PageProductOverview from './components/productoverview/PageProductOverview.vue';
import PageLogin from './components/login/PageLogin.vue';
import ForgotPassword from './components/login/ForgotPassword.vue';
import ResetPassword from './components/login/ResetPassword.vue';
import PageUserAccount from './components/useraccount/PageUserAccount.vue';
import PageNotFound from './components/common/PageNotFound.vue';
import PageProductDetail from './components/productdetail/PageProductDetail.vue';
import PageCartDetail from './components/cartdetail/PageCartDetail.vue';
import TabPersonalDetails from './components/useraccount/userdetail/TabPersonalDetails.vue';
import TabOrderList from './components/useraccount/myorders/TabOrderList.vue';
import TabOrderDetail from './components/useraccount/myorders/TabOrderDetail.vue';
import TabChangePassword from './components/useraccount/changepassword/TabChangePassword.vue';
import PageCheckout from './components/checkout/PageCheckout.vue';
import StepWithOverview from './components/checkout/StepWithOverview.vue';
import StepShippingAddressForm from './components/checkout/StepShippingAddressForm.vue';
import StepBillingAddressForm from './components/checkout/StepBillingAddressForm.vue';
import StepShippingMethodForm from './components/checkout/StepShippingMethodForm.vue';
import StepPaymentMethodForm from './components/checkout/StepPaymentMethodForm.vue';
import StepPlaceOrderForm from './components/checkout/StepPlaceOrderForm.vue';


Vue.use(Router);

const requiresAuth = true;
const requiresCart = true;

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes: [
    {
      path: '*',
      components: {
        default: PageNotFound,
        header: TheHeader,
        footer: TheFooter,
      },
    },
    {
      path: '/',
      name: 'home',
      components: {
        default: PageHome,
        header: TheHeader,
        footer: TheFooter,
      },
    },
    {
      path: '/stores',
      name: 'stores',
    },
    {
      path: '/login',
      name: 'login',
      components: {
        default: PageLogin,
        header: TheHeader,
        footer: TheFooter,
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      components: {
        default: ForgotPassword,
        header: TheHeader,
        footer: TheFooter,
      },
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      components: {
        default: ResetPassword,
        header: TheHeader,
        footer: TheFooter,
      },
    },
    {
      path: '/products/:categorySlug/:page?',
      name: 'products',
      components: {
        default: PageProductOverview,
        header: TheHeader,
        footer: TheFooter,
      },
      props: {
        default: (route) => {
          const pageNum = Number(route.params.page);
          const page = Number.isNaN(pageNum) || pageNum <= 1
            ? 1 : pageNum;
          return ({
            categorySlug: route.params.categorySlug,
            page,
          });
        },
        header: false,
        footer: false,
      },
    },
    {
      path: '/user',
      meta: { requiresAuth },
      components: {
        default: PageUserAccount,
        header: TheHeader,
        footer: TheFooter,
      },
      children: [
        {
          path: 'orders', name: 'orders', component: TabOrderList,
        },
        {
          path: 'orders/:id', name: 'order', component: TabOrderDetail,
        },
        {
          path: 'account', alias: '', name: 'user', component: TabPersonalDetails,
        },
        {
          path: 'changepassword', name: 'changepassword', component: TabChangePassword,
        },
      ],
    },
    {
      path: '/product/:productSlug/:sku',
      name: 'product',
      components: {
        default: PageProductDetail,
        header: TheHeader,
        footer: TheFooter,
      },
      props: {
        default: true,
        header: false,
        footer: false,
      },
    },
    {
      path: '/cart',
      name: 'cart',
      components: {
        default: PageCartDetail,
        header: TheHeader,
        footer: TheFooter,
      },
    },
    {
      path: '/checkout',
      meta: { requiresCart },
      components: {
        default: PageCheckout,
        header: TheCheckoutHeader,
        footer: TheCheckoutFooter,
      },
      children: [
        {
          path: '',
          component: StepWithOverview,
          children: [
            {
              path: 'payment', name: 'checkout-payment-method', component: StepPaymentMethodForm,
            },
            {
              path: 'shipping', name: 'checkout-shipping-method', component: StepShippingMethodForm,
            },
            {
              path: 'billing', name: 'checkout-billing-address', component: StepBillingAddressForm,
            },
            {
              path: 'address', alias: '', name: 'checkout', component: StepShippingAddressForm,
            },
          ],
        },
        {
          path: 'order', name: 'checkout-order', component: StepPlaceOrderForm,
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const routeRequiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (routeRequiresAuth && !store.state.authenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

router.beforeEach(async (to, from, next) => {
  const routeRequiresCart = to.matched.some(record => record.meta.requiresCart);
  if (routeRequiresCart) {
    const hasCart = await apollo.defaultClient
      .query({ query: gql`{ me { activeCart { id } } }` })
      .then(result => !!result.data.me.activeCart);
    if (!hasCart) next('/');
  }
  next();
});

export default router;
