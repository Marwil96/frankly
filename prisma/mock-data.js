const projects = [
  {
    project_name: "Random Store",
  },
  {
    project_name: "Awesome App",
  },
  {
    project_name: "Garden Revamp",
  },
  {
    project_name: "Pet Care",
  }
];

const reviews = [
  {
    review_content: "Nice pants!",
    under_review: false,
    approved: true,
    product_id: 1,
    project_id: 1,
    stars: 5,
    review_by: "john.doe@example.com"
  },
  {
    review_content: "Excellent mobile app!",
    under_review: false,
    approved: true,
    product_id: 1,
    project_id: 1,
    stars: 5,
    review_by: "jane.smith@example.com"
  },
  {
    review_content: "Slow shipping but good product",
    under_review: true,
    approved: false,
    product_id: 1,
    project_id: 1,
    stars: 3,
    review_by: "kate.wilson@example.com"
  },
  {
    review_content: "Disappointed with the service",
    under_review: false,
    approved: true,
    product_id: 1,
    project_id: 1,
    stars: 2,
    review_by: "sam.robinson@example.com"
  },
  {
    review_content: "Very responsive support team",
    under_review: false,
    approved: true,
    product_id: 1,
    project_id: 1,
    stars: 4,
    review_by: "mike.anderson@example.com"
  },
  {
    review_content: "Not worth the price",
    under_review: false,
    approved: true,
    product_id: 1,
    project_id: 1,
    stars: 1,
    review_by: "sarah.johnson@example.com"
  },
  {
    review_content: "Impressive design and quality",
    under_review: true,
    approved: false,
    product_id: 1,
    project_id: 1,
    stars: 5,
    review_by: "john.doe@example.com"
  }
]

const users = [
  {
    username: "Kalle Karlsson",
    email: "kalle@example.com",
    password: "summer2024",
    project_ids: [1]
  },
  {
    username: "John Doe",
    email: "john.doe@example.com",
    password: "secret123",
    project_ids: [1]
  },
  {
    username: "Jane Smith",
    email: "jane.smith@example.com",
    password: "password",
    project_ids: [1]
  }
]

module.exports = { projects, reviews, users };
