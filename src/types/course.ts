// src/types/course.ts

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  title: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  rating: number;
  enrolledCount: number;
  instructor: Instructor;
  isBookmarked: boolean;
  isEnrolled: boolean;
}

export interface CourseListResponse {
  courses: Course[];
  hasMore: boolean;
  currentPage: number;
  total: number;
}

export interface CourseWebPayload {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
  };
  price: string;
  category: string;
  rating: string;
  enrolledCount: string;
}
