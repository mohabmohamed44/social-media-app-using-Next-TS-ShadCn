export interface ICreatePost {
  body: string;
  image?: string | null; // Optional file object for FormData upload
}
