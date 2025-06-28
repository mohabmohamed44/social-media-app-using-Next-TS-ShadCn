import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/AuthSlice";
import { profileReducer } from "./slices/LoggedInUserData";
import { profilePhotoReducer } from "./slices/ProfilePhotoSlice";
import { updatePasswordReducer } from "./slices/UpdatePasswordSlice";
export const store = configureStore({
  // reducer for slices
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    profilePhoto: profilePhotoReducer,
    updatePassword: updatePasswordReducer,
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

export type dispatchType = typeof store.dispatch;
// In your store.ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
