import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import categoryReducer from './slices/categorySlice'
import productReducer from './slices/productSlice'
import riderReducer from './slices/riderSlice'
import batchReducer from './slices/batchSlice'
import sellerReducer from './slices/sellerSlice'
import userReducer from './slices/userSlice'
import deliveryZoneReducer from './slices/deliveryZoneSlice'
import orderReducer from './slices/orderSlice'
import campusReducer from './slices/campusSlice'
import promotionReducer from './slices/promotionSlice'
import marketplaceReducer from './slices/marketplaceSlice'
import ledgerReducer from './slices/ledgerSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    products: productReducer,
    riders: riderReducer,
    batches: batchReducer,
    sellers: sellerReducer,
    users: userReducer,
    deliveryZones: deliveryZoneReducer,
    orders: orderReducer,
    campuses: campusReducer,
    promotions: promotionReducer,
    marketplace: marketplaceReducer,
    ledger: ledgerReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
