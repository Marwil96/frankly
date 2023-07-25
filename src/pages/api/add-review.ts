import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    review_content,
    under_review,
    approved,
    product_id,
    project_id,
    stars,
    review_by,
  } = req.body;

  try {
    const createdReview = await prisma.review.create({
      data: {
        review_content: review_content,
        under_review: under_review,
        approved: approved,
        product_id: product_id,
        stars: stars,
        review_by: review_by,
        project: {
          connect: { id: project_id },
        },
      },
    });

    res.status(201).json(createdReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
