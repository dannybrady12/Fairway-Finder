import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface CourseReviewFormProps {
  courseId: string;
  userId: string;
  onSuccess?: () => void;
}

export default function CourseReviewForm({ courseId, userId, onSuccess }: CourseReviewFormProps) {
  const supabase = createBrowserClient();
  const [form, setForm] = useState({
    greens: '3',
    layout: '3',
    pace_of_play: '3',
    conditions: '3',
    scenery: '3',
    value: '3',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateOverallRating = (ratings: number[]) => {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Math.round(avg * 2 * 10) / 10; // 1–5 to 2–10 scale, rounded to 1 decimal
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const ratings = [
      parseInt(form.greens),
      parseInt(form.layout),
      parseInt(form.pace_of_play),
      parseInt(form.conditions),
      parseInt(form.scenery),
      parseInt(form.value),
    ];
    const overall_rating = calculateOverallRating(ratings);

    const { error } = await supabase.from('reviews').insert({
      course_id: courseId,
      user_id: userId,
      greens: ratings[0],
      layout: ratings[1],
      pace_of_play: ratings[2],
      conditions: ratings[3],
      scenery: ratings[4],
      value: ratings[5],
      comment: form.comment,
      overall_rating,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setForm({
        greens: '3', layout: '3', pace_of_play: '3', conditions: '3', scenery: '3', value: '3', comment: '',
      });
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-lg font-bold">Rate This Course</h2>

      {['greens', 'layout', 'pace_of_play', 'conditions', 'scenery', 'value'].map((field) => (
        <div key={field}>
          <label className="block mb-1 capitalize">{field.replace(/_/g, ' ')}</label>
          <select name={field} value={(form as any)[field]} onChange={handleChange} className="w-full border p-2 rounded">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      ))}

      <div>
        <label className="block mb-1">Comment (optional)</label>
        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          rows={3}
        />
      </div>

      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>

      {success && <p className="text-green-600">Review submitted successfully!</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
    </form>
  );
}
