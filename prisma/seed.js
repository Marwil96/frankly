const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { users, reviews, projects } = require('./mock-data.js'); // <-- import mock data

const load = async () => {
  try {
    await prisma.review.deleteMany();
    console.log('Deleted records in review table');

    await prisma.user.deleteMany();
    console.log('Deleted records in user table');

    await prisma.project.deleteMany();
    console.log('Deleted records in project table');

    await prisma.$queryRaw`ALTER TABLE Review AUTO_INCREMENT = 1`;
    console.log('reset review auto increment to 1');

    await prisma.$queryRaw`ALTER TABLE User AUTO_INCREMENT = 1`;
    console.log('reset user auto increment to 1');

    await prisma.$queryRaw`ALTER TABLE Project AUTO_INCREMENT = 1`;
    console.log('reset project auto increment to 1');

    for (const project of projects) {
      await prisma.project.create({
        data: {
          project_name: project.project_name,
        },
      });
      console.log(`Added project "${project.project_name}"`);
    }

    for (const user of users) {
      const createdUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {}, // Leave empty if you don't want to update existing users
        create: {
          username: user.username,
          email: user.email,
          password: user.password,
          projects: {
            connect: user.project_ids.map((projectId) => ({ id: projectId })),
          },
        },
      });
      console.log(`Added user "${createdUser.username}"`);
    }

    // Create reviews
    for (const review of reviews) {
      await prisma.review.create({
        data: {
          review_content: review.review_content,
          under_review: review.under_review,
          approved: review.approved,
          review_by: review.review_by,
          product_id: review.product_id,
          stars: review.stars,
          project: {
            connect: { id: review.project_id },
          },
        },
      });
      console.log('Added review data', review.review_content);
    }
    console.log('Added review data');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
