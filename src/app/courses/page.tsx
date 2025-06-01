"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TypeScript type for a course record
type Course = {
  id: string;
  name: string;
  city: string;
  state: string;
  total_holes: number;
  par: number;
};

export default function CourseBrowser() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, city, state, total_holes, par")
        .order("name");

      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data as Course[]);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🏌️‍♂️ Browse Golf Courses</h1>

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border p-4 shadow hover:shadow-lg transition cursor-pointer bg-white"
            >
              <h2 className="text-xl font-semibold">{course.name}</h2>
              <p className="text-sm text-gray-500">
                {course.city}, {course.state}
              </p>
              <div className="mt-2 text-sm text-gray-700">
                <p>Holes: {course.total_holes}</p>
                <p>Par: {course.par}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

