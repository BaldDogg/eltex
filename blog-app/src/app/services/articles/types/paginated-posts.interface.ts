import { Post } from "../../../models/post";

export interface PaginatedPosts {
    posts: Post[];
    totalCount: number;
}