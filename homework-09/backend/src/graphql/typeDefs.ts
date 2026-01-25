// GraphQL схема в виде строки SDL.

export const typeDefs = `#graphql
  type Rating {
    rate: Float
    count: Int
  }

  type Product {
    id: ID!
    title: String!
    price: Float!
    description: String
    category: String
    image: String
    rating: Rating
  }

  type CartItem {
    productId: ID!
    quantity: Int!
    product: Product
  }

  type Cart {
    items: [CartItem!]!
    total: Float!
  }

  type ProductsPage {
    items: [Product!]!
    total: Int!
    hasMore: Boolean!
  }

  input ProductInput {
    title: String!
    price: Float!
    description: String
    category: String
    image: String
    rate: Float
    count: Int
  }

  input UpdateProductInput {
    title: String
    price: Float
    description: String
    category: String
    image: String
    rate: Float
    count: Int
  }

  type Query {
    products(category: String, limit: Int, offset: Int): ProductsPage!
    product(id: ID!): Product
    categories: [String!]!
    cart: Cart!
  }

  type Mutation {
    addProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    addToCart(productId: ID!, quantity: Int = 1): Cart!
    updateCartItem(productId: ID!, quantity: Int!): Cart!
  }

  type Subscription {
    productAdded: Product!
    productUpdated: Product!
    cartUpdated: Cart!
  }
`;
