import Head from 'next/head';
import AddReviewForm from '../components/ReviewForm';
import { prisma } from './../../lib/prisma';

async function getData() {
  const reviews = await prisma.review.findMany({
    where: {
      project_id: 1, // Should be the id of the user that is logged in
      // product_id: 1 // Filter on Product? Load up product or something ...
    }
  });

  return {
    reviews
  };
}


const Home = async () => {
  const { reviews } = await getData();
  console.log(reviews, reviews)
  if (!reviews) return <div>Loading...</div>

  return (
    <div>
      <Head>
        <title>PlanetScale Next.js Quickstart</title>
        <meta name="description" content="PlanetScale Quickstart for Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-10 mx-auto max-w-4xl">
        <h1 className="text-6xl font-bold mb-4 text-center">Next.js Starter</h1>
        <p className="mb-20 text-xl text-center">
          🔥 Shop from the hottest items in the world 🔥
        </p>
        <AddReviewForm />
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 justify-items-center  gap-4">
          {reviews.map((review, index) => (
            <div key={index}>
              <h1>{review.review_content}</h1>
            </div>
          ))}
        </div>
      </main>

      <footer></footer>
    </div>
  );
}
export default Home;
