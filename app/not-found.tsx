import React from 'react'
import Link from 'next/link';

const Custom404 = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Oops! The page you are looking for does not exist.</p>
      <Link href="/" className="text-primary hover:underline">
        Go back to Home
      </Link>
    </div>
  )
}

export const getStaticProps = async () => {
  return {
    notFound: true,
  };
};

export default Custom404