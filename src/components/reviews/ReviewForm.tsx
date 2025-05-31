'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Course, ReviewLevel } from '@/types/database.types';
import Image from 'next/image';
import { X, Camera, Loader2 } from 'lucide-react';

// Common golf course tags
const COURSE_TAGS = [
  'Fast Greens',
  'Slow Greens',
  'Well Maintained',
  'Challenging',
  'Beginner Friendly',
  'Great Value',
  'Scenic Views',
  'Good Pace of Play',
  'Slow Pace of Play',
  'Cart Included',
  'Walking Friendly',
  'Difficult Bunkers',
  'Water Hazards',
  'Tight Fairways',
  'Wide Fairways',
  'Good Practice Facilities',
  'Friendly Staff',
  'Good Food',
  'Worth the Price'
];

interface ReviewFormProps {
  course: Course;
}

export default function ReviewForm({ course }: ReviewFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  
  const [reviewLevel, setReviewLevel] = useState<ReviewLevel | null>(null);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    setImages([...images, ...newFiles]);
    
    // Create preview URLs
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newUrls]);
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newUrls = [...imageUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newImages.splice(index, 1);
    newUrls.splice(index, 1);
    
    setImages(newImages);
    setImageUrls(newUrls);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewLevel) {
      setError('Please select how you felt about this course');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to submit a review');
      }
      
      // Check if user already has a review for this course
      const { data: existingReview } = await supabase
        .from('course_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single();
      
      let reviewId;
      
      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('course_reviews')
          .update({
            review_level: reviewLevel,
            comment: comment.trim() || null,
            tags: selectedTags.length > 0 ? selectedTags : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);
        
        if (updateError) throw updateError;
        reviewId = existingReview.id;
      } else {
        // Insert new review
        const { data: newReview, error: insertError } = await supabase
          .from('course_reviews')
          .insert({
            course_id: course.id,
            user_id: user.id,
            review_level: reviewLevel,
            comment: comment.trim() || null,
            tags: selectedTags.length > 0 ? selectedTags : null
          })
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        reviewId = newReview.id;
      }
      
      // Upload images if any
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${reviewId}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('review-images')
            .upload(fileName, image);
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: publicUrl } = supabase.storage
            .from('review-images')
            .getPublicUrl(fileName);
          
          // Insert image record
          const { error: imageInsertError } = await supabase
            .from('review_images')
            .insert({
              review_id: reviewId,
              image_url: publicUrl.publicUrl
            });
          
          if (imageInsertError) throw imageInsertError;
        }
      }
      
      // Redirect back to course page
      router.push(`/courses/${course.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your review');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review {course.name}</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Review level selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How was your experience?
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setReviewLevel('loved_it')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 ${
                reviewLevel === 'loved_it' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <span className="text-4xl mb-2">😍</span>
              <span className={`font-medium ${reviewLevel === 'loved_it' ? 'text-green-700' : 'text-gray-900'}`}>
                Loved It
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setReviewLevel('liked_it')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 ${
                reviewLevel === 'liked_it' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <span className="text-4xl mb-2">🙂</span>
              <span className={`font-medium ${reviewLevel === 'liked_it' ? 'text-blue-700' : 'text-gray-900'}`}>
                Liked It
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setReviewLevel('ok')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 ${
                reviewLevel === 'ok' 
                  ? 'border-gray-500 bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-4xl mb-2">😐</span>
              <span className={`font-medium ${reviewLevel === 'ok' ? 'text-gray-700' : 'text-gray-900'}`}>
                OK
              </span>
            </button>
          </div>
        </div>
        
        {/* Comment */}
        <div className="mb-6">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Add a comment (optional)
          </label>
          <textarea
            id="comment"
            rows={3}
            placeholder="Share your thoughts about this course..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        
        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add tags (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {COURSE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedTags.includes(tag)
                    ? 'bg-green-100 text-green-800 border-green-200 border'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent border'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* Image upload */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add photos (optional)
          </label>
          
          <div className="flex flex-wrap gap-3 mb-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={url}
                  alt={`Uploaded image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <label className="h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              <Camera className="h-8 w-8 text-gray-400" />
              <span className="mt-1 text-xs text-gray-500">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          
          <p className="text-xs text-gray-500">
            You can upload up to 5 photos. Each photo must be less than 5MB.
          </p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
