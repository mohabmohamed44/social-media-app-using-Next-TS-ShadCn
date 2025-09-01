import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/AuthSlice";
import { profileReducer } from "./slices/LoggedInUserData";
import { profilePhotoReducer } from "./slices/ProfilePhotoSlice";
import { updatePasswordReducer } from "./slices/UpdatePasswordSlice";
import { createPostReducer } from "./slices/CreatePostSlice";
import {userPosts} from "./slices/getUserPostsSlice";
import {postsReducer} from './slices/getAllPosts';
export const store = configureStore({
  // reducer for slices
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    profilePhoto: profilePhotoReducer,
    updatePassword: updatePasswordReducer,
    createPost: createPostReducer,
    userPosts: userPosts,
    posts: postsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "presist/PRESIST",
          "presist/REHYDRATE",
          "profilePhoto/setSelectedFile",
        ],
        ignoredPaths: ["profilePhoto.selectedFile"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;