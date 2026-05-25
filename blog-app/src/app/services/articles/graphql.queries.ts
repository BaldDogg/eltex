import { gql } from 'apollo-angular';

export const GET_POST_QUERY = gql`
  query GetPost($id: ID!) {
    article(id: $id) { id title content categoryId rating createdAt imgSrc } 
    commentsByArticle(articleId: $id) { id articleId username content rating createdAt }
  }
`;

export const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($input: CreateCommentInput!) {
    createComment(createComment: $input) { id articleId username content rating createdAt }
  }
`;

export const ARTICLE_UP = gql`mutation Up($id: ID!) { articleRatingUp(id: $id) { id rating } }`;
export const ARTICLE_DOWN = gql`mutation Down($id: ID!) { articleRatingDown(id: $id) { id rating } }`;

export const COMMENT_UP = gql`mutation Up($id: ID!) { commentRatingUp(id: $id) { id rating } }`;
export const COMMENT_DOWN = gql`mutation Down($id: ID!) { commentRatingDown(id: $id) { id rating } }`;