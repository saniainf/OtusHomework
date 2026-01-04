import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest'
import { useBasketStore } from '../basketStore';
import { createProductFixture } from '../../__tests__/fixtures/product.js';

describe('basketStore', () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
    });

    it('должен добавлять товар в корзину', () => {
        const basketStore = useBasketStore();
        const product = createProductFixture({ price: 10.0 });
        const basketItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            qty: 1,
        }

        basketStore.add(product);

        expect(basketStore.itemsCount).toBe(1);
        expect(basketStore.totalCount).toBe(1);
        expect(basketStore.totalAmount).toBe('10.00');
        expect(basketStore.items[0]).toEqual(basketItem);
    });

    it('должен увеличивать количество при повторном добавлении', () => {
        const basketStore = useBasketStore();
        const product = createProductFixture({ price: 10.0 });

        basketStore.add(product);
        basketStore.add(product);

        expect(basketStore.itemsCount).toBe(1);
        expect(basketStore.totalCount).toBe(2);
        expect(basketStore.totalAmount).toBe('20.00');
    });

    it('должен уменьшать количество товара', () => {
        const basketStore = useBasketStore();
        const product = createProductFixture({ price: 10.0 });

        basketStore.add(product);
        basketStore.add(product);
        basketStore.decrement(product.id);

        expect(basketStore.itemsCount).toBe(1);
        expect(basketStore.totalCount).toBe(1);
        expect(basketStore.totalAmount).toBe('10.00');
    });

    it('должен удалять товар при нулевом количестве', () => {
        const basketStore = useBasketStore();
        const product = createProductFixture();

        basketStore.add(product);
        basketStore.decrement(product.id);

        expect(basketStore.itemsCount).toBe(0);
        expect(basketStore.totalCount).toBe(0);
        expect(basketStore.totalAmount).toBe('0.00');
    });

    it('должен очищать корзину', () => {
        const basketStore = useBasketStore();
        const product1 = createProductFixture({ id: 1 });
        const product2 = createProductFixture({ id: 2 });

        basketStore.add(product1);
        basketStore.add(product2);
        basketStore.clear();

        expect(basketStore.itemsCount).toBe(0);
        expect(basketStore.totalCount).toBe(0);
        expect(basketStore.totalAmount).toBe('0.00');
    });

    it('должен удалять конкретный товар', () => {
        const basketStore = useBasketStore();
        const product1 = createProductFixture({ id: 1 });
        const product2 = createProductFixture({ id: 2, price: 20.0 });

        basketStore.add(product1);
        basketStore.add(product2);
        basketStore.remove(product1.id);

        expect(basketStore.itemsCount).toBe(1);
        expect(basketStore.totalCount).toBe(1);
        expect(basketStore.totalAmount).toBe('20.00');
    });
});