import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest'
import { useBasketStore } from '../basketStore';

describe('basketStore', () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
    });

    it('should add item to basket', () => {
        const basketStore = useBasketStore();
        const product = { id: 1, title: 'Product 1', price: 10.0, image: 'image1.jpg' };

        basketStore.add(product);

        expect(basketStore.itemsCount).toBe(1);
        expect(basketStore.totalCount).toBe(1);
        expect(basketStore.totalAmount).toBe('10.00');
        expect(basketStore.items[0]).toEqual(
            { id: 1, title: 'Product 1', price: 10.0, image: 'image1.jpg', qty: 1 }
        );
    });

    it('should increment item quantity if added again', () => {
        const basketStore = useBasketStore();
        const product = { id: 1, title: 'Product 1', price: 10.0, image: 'image1.jpg' };

        basketStore.add(product);
        basketStore.add(product);

        expect(basketStore.itemsCount).toBe(1);
        expect(basketStore.totalCount).toBe(2);
        expect(basketStore.totalAmount).toBe('20.00');
    });

    it('should decrement item quantity', () => {
        const basketStore = useBasketStore();
        const product = { id: 1, title: 'Product 1', price: 10.0, image: 'image1.jpg' };

        basketStore.add(product);
        basketStore.add(product);
        basketStore.decrement(product.id);

        expect(basketStore.itemsCount).toBe(1);
        expect(basketStore.totalCount).toBe(1);
        expect(basketStore.totalAmount).toBe('10.00');
    });

    it('should remove item when quantity reaches zero', () => {
        const basketStore = useBasketStore();
        const product = { id: 1, title: 'Product 1', price: 10.0, image: 'image1.jpg' };

        basketStore.add(product);
        basketStore.decrement(product.id);

        expect(basketStore.itemsCount).toBe(0);
        expect(basketStore.totalCount).toBe(0);
        expect(basketStore.totalAmount).toBe('0.00');
    });

    it('should clear the basket', () => {
        const basketStore = useBasketStore();
        const product1 = { id: 1, title: 'Product 1', price: 10.0, image: 'image1.jpg' };
        const product2 = { id: 2, title: 'Product 2', price: 20.0, image: 'image2.jpg' };

        basketStore.add(product1);
        basketStore.add(product2);
        basketStore.clear();

        expect(basketStore.itemsCount).toBe(0);
        expect(basketStore.totalCount).toBe(0);
        expect(basketStore.totalAmount).toBe('0.00');
    });

    it('should remove specific item from basket', () => {
        const basketStore = useBasketStore();
        const product1 = { id: 1, title: 'Product 1', price: 10.0, image: 'image1.jpg' };
        const product2 = { id: 2, title: 'Product 2', price: 20.0, image: 'image2.jpg' };

        basketStore.add(product1);
        basketStore.add(product2);
        basketStore.remove(product1.id);

        expect(basketStore.itemsCount).toBe(1);
        expect(basketStore.totalCount).toBe(1);
        expect(basketStore.totalAmount).toBe('20.00');
    });
});