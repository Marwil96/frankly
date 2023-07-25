'use client'

import React, { useState, FormEvent } from 'react';

const AddReviewForm: React.FC = () => {
  const [reviewContent, setReviewContent] = useState('');
  const [stars, setStars] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      review_content: reviewContent,
      under_review: false,
      approved: true,
      product_id: 1,
      project_id: 1,
      stars: parseInt(stars),
      review_by: 'john.doe@example.com',
    };

    try {
      const response = await fetch('/api/add-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Review added successfully
        // You can handle the success scenario here
        console.log('Review added successfully');
      } else {
        // Error handling for unsuccessful response
        console.error('Failed to add review');
      }
    } catch (error) {
      // Error handling for network errors
      console.error('Failed to add review:', error);
    }
  };

  return (<form onSubmit={handleSubmit}>
    <div>
      <label>Review:</label>
      <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} />
    </div>
    <div>
      <label>Stars:</label>
      <input type="number" value={stars} onChange={(e) => setStars(e.target.value)} />
    </div>
    <button type="submit">Submit Review</button>
  </form>)
};

export default AddReviewForm
