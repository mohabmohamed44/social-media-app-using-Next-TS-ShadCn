export interface PostUser {
  id: string;
  name: string;
  photo: string;
}

export interface Comment {
  id: string;
  content: string;
  commentCreator: PostUser;
  post: string;
  createdAt: string;
}

export interface Post {
  id: string;
  body: string;
  image: string;
  user: PostUser;
  createdAt: string;
  comments?: Comment[];
  commentsCount?: number;
}

export interface PostsResponse {
  posts: Post[];
  paginationInfo?: {
    numberOfPages: number;
    total: number;
  };
}