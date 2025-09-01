export interface ICreatePost {
  body: string;
  image?: string | null; // Optional file object for FormData upload
}

export interface User {
  _id: string;
  name: string;
  photo: string;
}

export interface Comment {
  _id: string;
  content: string;
  commentCreator: User;
  post: string;
  createdAt: string;
}

export interface postInterface {
  _id: string;
  body: string;
  image: string;
  user: User;
  createdAt: string;
  comments: Comment[];
  id:string
}