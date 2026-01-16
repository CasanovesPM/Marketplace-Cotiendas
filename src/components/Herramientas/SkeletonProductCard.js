// src/components/SkeletonProductCard.js
import React from 'react';
import './SkeletonProductCard.css';

const SkeletonProductCard = () => {
  return (
    <div className="product-card skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-title" />
      <div className="skeleton-price" />
      <div className="skeleton-location" />
    </div>
  );
};

export default SkeletonProductCard;
