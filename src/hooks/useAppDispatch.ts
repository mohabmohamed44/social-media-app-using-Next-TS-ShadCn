import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/redux/store";

export const useAppDispatch: () => AppDispatch = useDispatch;