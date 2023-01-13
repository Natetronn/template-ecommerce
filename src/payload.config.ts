import { buildConfig } from 'payload/config';
import path from 'path';
import Users from './collections/Users';
import Products from './collections/Products';
import Orders from './collections/Orders';
import Categories from './collections/Categories';
import stripePlugin from '@payloadcms/plugin-stripe';
import nestedDocs from '@payloadcms/plugin-nested-docs';
import { Header } from './globals/Header';
import { Footer } from './globals/Footer';
import { Pages } from './collections/Pages';
import { Media } from './collections/Media';
import seo from '@payloadcms/plugin-seo';
import { GenerateTitle } from '@payloadcms/plugin-seo/types';
import { subscriptionCreatedOrUpdated } from './stripe/webhooks/subscriptionCreatedOrUpdated';
import { subscriptionDeleted } from './stripe/webhooks/subscriptionDeleted';
import { productUpdated } from './stripe/webhooks/productUpdated';
import { priceUpdated } from './stripe/webhooks/priceUpdated';
import { Cart } from './globals/Cart';

const generateTitle: GenerateTitle = () => {
  return 'hi'
}

const mockModulePath = path.resolve(__dirname, './emptyModuleMock.js')

export default buildConfig({
  serverURL: 'http://localhost:8000',
  admin: {
    user: Users.slug,
    webpack: config => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          [path.resolve(__dirname, 'collections/Products/hooks/beforeChange.ts')]: mockModulePath,
          stripe: mockModulePath,
          express: mockModulePath,
        },
      },
    }),
  },
  collections: [
    Users,
    Products,
    Categories,
    Orders,
    Pages,
    Media,
  ],
  globals: [
    Header,
    Footer,
    Cart
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  cors: [
    process.env.PAYLOAD_PUBLIC_APP_URL || '*'
  ],
  csrf: [
    process.env.PAYLOAD_PUBLIC_APP_URL || ''
  ],
  plugins: [
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      webhooks: {
        'customer.subscription.created': subscriptionCreatedOrUpdated,
        'customer.subscription.updated': subscriptionCreatedOrUpdated,
        'customer.subscription.deleted': subscriptionDeleted,
        'product.created': productUpdated,
        'product.updated': productUpdated,
        'price.updated': priceUpdated,
      }
    }),
    nestedDocs({
      collections: ['categories']
    }),
    seo({
      collections: [
        'pages',
        'products'
      ],
      generateTitle,
      uploadsCollection: 'media',
    })
  ]
});
