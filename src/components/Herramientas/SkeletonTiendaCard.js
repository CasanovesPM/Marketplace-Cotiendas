import React from 'react';
import './SkeletonTiendaCard.css';

const SkeletonTiendaCard = () => {
  return (
    <div className="skeleton-tienda-card">
      <div className="skeleton-logo"></div>
      <div className="skeleton-line skeleton-nombre"></div>
      <div className="skeleton-line skeleton-ciudad"></div>
      <div className="skeleton-line skeleton-stars"></div>
      <div className="skeleton-line skeleton-info"></div>
      <div className="skeleton-line skeleton-info"></div>
      <div className="skeleton-line skeleton-info-small"></div>
    </div>
  );
};

export default SkeletonTiendaCard;
