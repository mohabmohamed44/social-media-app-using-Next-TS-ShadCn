export const queryKeys = {
  profile: ["profile"] as const,
  posts: (page: number, limit: number) => ["posts", page, limit] as const,
  latestPosts: ["posts", "latest"] as const,
  post: (id: string) => ["post", id] as const,
  comments: (postId: string) => ["comments", postId] as const,
  userPosts: (userId: string, limit: number) => ["userPosts", userId, limit] as const,
};