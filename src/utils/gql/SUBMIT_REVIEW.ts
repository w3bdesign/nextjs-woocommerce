import { gql } from '@apollo/client';

export const SUBMIT_REVIEW = gql`
  mutation SubmitReview($input: SubmitReviewInput!) {
    submitReview(input: $input) {
      success
      message
      review {
        id
        author
        content
        rating
        verified
      }
      clientMutationId
    }
  }
`;
