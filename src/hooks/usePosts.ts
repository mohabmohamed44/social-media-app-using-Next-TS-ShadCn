import { useQuery } from "@tanstack/react-query";
import axios from 'axios';

const fetchPosts = async () => {
    const {data} = await axios.get("https://linked-posts.routemisr.com/posts?limit=50");
    return data;
}

export const usePosts = () => {
    return useQuery({
        queryKey: ['posts'],
        queryFn: fetchPosts,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
};