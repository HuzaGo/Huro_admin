import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import categoryReducer from './slices/categorySlice'
import productReducer from './slices/productSlice'
import riderReducer from './slices/riderSlice'
import batchReducer from './slices/batchSlice'
import sellerReducer from './slices/sellerSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    products: productReducer,
    riders: riderReducer,
    batches: batchReducer,
    sellers: sellerReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
