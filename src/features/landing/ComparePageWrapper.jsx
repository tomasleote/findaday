import React from 'react';
import { useParams } from 'react-router-dom';
import ComparePage from './ComparePage';

export default function ComparePageWrapper() {
    const { competitor } = useParams();
    return <ComparePage competitorSlug={competitor} />;
}
