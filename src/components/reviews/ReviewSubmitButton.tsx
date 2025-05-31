import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

interface ReviewSubmitButtonProps {
  courseId: string;
}

export default function ReviewSubmitButton({ courseId }: ReviewSubmitButtonProps) {
  return (
    <Link 
      href={`/courses/${courseId}/review`}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Add Review
    </Link>
  );
}
