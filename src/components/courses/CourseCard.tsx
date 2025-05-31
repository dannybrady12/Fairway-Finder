'use client';

import { Course } from '@/types/database.types';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  showRanking?: boolean;
}

export default function CourseCard({ course, showRanking = true }: CourseCardProps) {
  // Function to render the aggregate score badge
  const renderAggregateBadge = () => {
    if (!course.aggregate_score) return null;
    
    // Determine color based on score
    let bgColor = 'bg-gray-100 text-gray-800';
    if (course.aggregate_score >= 8) {
      bgColor = 'bg-green-100 text-green-800';
    } else if (course.aggregate_score >= 6) {
      bgColor = 'bg-blue-100 text-blue-800';
    } else if (course.aggregate_score >= 4) {
      bgColor = 'bg-yellow-100 text-yellow-800';
    } else {
      bgColor = 'bg-red-100 text-red-800';
    }
    
    return (
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-md font-medium text-sm ${bgColor}`}>
        {course.aggregate_score.toFixed(1)}
      </div>
    );
  };
  
  // Function to render confidence dots
  const renderConfidenceDots = () => {
    if (!course.confidence_rating) return null;
    
    // Calculate confidence level display (1-5 dots)
    const confidenceDots = Math.ceil(course.confidence_rating * 5);
    
    return (
      <div className="absolute top-3 left-3 flex">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`h-2 w-2 rounded-full mx-0.5 ${
              i < confidenceDots ? 'bg-green-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <Link href={`/courses/${course.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Course image */}
        <div className="relative h-48 bg-gray-200">
          {/* If we had course images, we would display them here */}
          {/* <Image src={course.image_url} alt={course.name} fill className="object-cover" /> */}
          
          {/* Placeholder for now */}
          <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
            <span className="text-sm">Course Image</span>
          </div>
          
          {/* Aggregate score badge */}
          {showRanking && renderAggregateBadge()}
          
          {/* Confidence indicator */}
          {showRanking && renderConfidenceDots()}
        </div>
        
        {/* Course info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{course.city}, {course.state}</span>
          </div>
          
          {/* Course details */}
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-500">Par:</span> {course.par || 'N/A'}
            </div>
            <div>
              <span className="text-gray-500">Holes:</span> {course.total_holes}
            </div>
            {course.rating && (
              <div>
                <span className="text-gray-500">Rating:</span> {course.rating}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
