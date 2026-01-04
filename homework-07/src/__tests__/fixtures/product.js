export function createProductFixture(overrides = {}) {
  return {
    id: 42,
    title: 'Куртка',
    price: 10.00,
    category: 'Одежда',
    image: 'https://example.com/jacket.png',
    rating: {
      rate: 4.3,
      count: 120,
    },
    ...overrides,
  };
}
