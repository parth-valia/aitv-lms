// src/hooks/useCourses.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/services/api/courses';

export function useCourses(limit = 10) {
  return useInfiniteQuery({
    queryKey: ['courses'],
    queryFn: ({ pageParam = 1 }) => coursesApi.getCourseList(pageParam, limit),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      // Since we don't have a direct "get product by id" in the brief list, 
      // we'll fetch a list and find it, or mock if needed.
      // In a real app, this would be a dedicated endpoint like `coursesApi.getCourseById(id)`.
      const list = await coursesApi.getCourseList(1, 50);
      return list.courses.find(c => c.id === id);
    },
    enabled: !!id,
  });
}
