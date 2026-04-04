// src/services/api/courses.ts
import { apiClient } from './apiClient';
import { PublicProductSchema, PublicUserSchema, PaginatedResponseSchema, UserSchema } from './schemas';
import { Course } from '@/types/course';
import { API } from '@/constants/api';
import { z } from 'zod';

const PaginatedProductsSchema = PaginatedResponseSchema(PublicProductSchema);
const PaginatedInstructorsSchema = PaginatedResponseSchema(PublicUserSchema);

type PublicProduct = z.infer<typeof PublicProductSchema>;
type PublicUser = z.infer<typeof PublicUserSchema>;
type ApiUser = z.infer<typeof UserSchema>;

interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  nextPage: boolean;
  previousPage: boolean;
  page: number;
}

const INSTRUCTOR_TITLES = [
  'Instructor',
  'Lead Educator',
  'Course Director',
  'Teaching Fellow',
  'Principal Trainer',
] as const;

const PREMIUM_THUMBNAILS = [
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  'https://images.unsplash.com/photo-1627398242454-46a1aba212cc?w=800&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  'https://images.unsplash.com/photo-1531297172867-4f505dbce15a?w=800&q=80',
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80'
];

export const coursesApi = {
  getCourses: async (
    page = 1,
    limit = 10,
    category?: string
  ): Promise<PaginatedResult<PublicProduct>> => {
    // Mapping UI categories to real API categories that have data
    const categoryMap: Record<string, string> = {
      'Design': 'home-decoration',
      'Code': 'laptops',
      'Marketing': 'fragrances',
      'Business': 'mens-watches',
      'Soft Skills': 'skincare',
    };

    const query = category && category !== 'All' ? categoryMap[category] || category : '';
    try {
      const response = await apiClient<unknown>(
        `${API.endpoints.public.randomProducts}?page=${page}&limit=${limit}${query ? `&query=${query}` : ''}`
      );
      const validated = PaginatedProductsSchema.parse(response);
      return validated.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getInstructors: async (
    page = 1,
    limit = 10
  ): Promise<PaginatedResult<PublicUser>> => {
    const response = await apiClient<unknown>(
      `${API.endpoints.public.randomUsers}?page=${page}&limit=${limit}`
    );
    const validated = PaginatedInstructorsSchema.parse(response);
    return validated.data;
  },

  /**
   * Merges randomproducts + randomusers into enriched Course objects.
   * This is our data merging strategy:
   * - Fetch both endpoints in parallel
   * - Zip by index to create instructor-enriched courses
   * - Synthetic fields (rating, enrolledCount) where API doesn't provide them
   */
  /**
   * Fetch a single course by its product ID.
   * Uses the /public/randomproducts/:id endpoint, then pairs with a
   * deterministic instructor so the full Course object can be constructed.
   */
  getCourseById: async (id: string): Promise<Course | null> => {
    try {
      const response = await apiClient<unknown>(
        `${API.endpoints.public.randomProducts}/${id}`
      );
      const data = response as any;
      // freeapi.app single-resource shape: { data: { ...product } }
      const product: z.infer<typeof PublicProductSchema> =
        PublicProductSchema.parse(data?.data ?? data);

      const instructorRes = await coursesApi.getInstructors(1, 5);
      const instructor = instructorRes.data[product.id % instructorRes.data.length]
        ?? instructorRes.data[0];

      const syntheticRating = 3.5 + (product.id % 16) / 10;
      const syntheticEnrolled = 50 + (product.id % 950);
      const thumbnailIndex = product.id % PREMIUM_THUMBNAILS.length;

      return {
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        price: product.price,
        thumbnail: PREMIUM_THUMBNAILS[thumbnailIndex],
        category: product.category ?? 'General',
        rating: Math.round(syntheticRating * 10) / 10,
        enrolledCount: syntheticEnrolled,
        instructor: {
          id: instructor?.id.toString() ?? 'unknown',
          name: `${instructor?.name.first} ${instructor?.name.last}`.trim(),
          avatar:
            instructor?.picture?.large ??
            `https://ui-avatars.com/api/?name=Instructor&background=6366f1&color=fff`,
          title: INSTRUCTOR_TITLES[product.id % INSTRUCTOR_TITLES.length],
        },
        isBookmarked: false,
        isEnrolled: false,
      };
    } catch {
      return null;
    }
  },

  getCourseList: async (
    page = 1,
    limit = 10,
    category?: string
  ): Promise<{
    courses: Course[];
    hasMore: boolean;
    currentPage: number;
    total: number;
  }> => {
    const [products, instructors] = await Promise.all([
      coursesApi.getCourses(page, limit, category),
      coursesApi.getInstructors(page, limit),
    ]);

    const courses: Course[] = products.data.map((product, idx) => {
      const instructor =
        instructors.data[idx % instructors.data.length] ?? instructors.data[0];

      // Deterministic synthetic rating based on product ID
      const syntheticRating = 3.5 + (product.id % 16) / 10; // Range: 3.5 - 5.0
      const syntheticEnrolled = 50 + (product.id % 950); // Range: 50 - 999
      
      // Deterministic premium image mapping (to guarantee it always looks great)
      const thumbnailIndex = (product.id + idx) % PREMIUM_THUMBNAILS.length;

      return {
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        price: product.price,
        thumbnail: PREMIUM_THUMBNAILS[thumbnailIndex] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
        category: category || 'General', // Keep the category as the UI name so filtering works
        rating: Math.round(syntheticRating * 10) / 10,
        enrolledCount: syntheticEnrolled,
        instructor: {
          id: instructor?.id.toString() ?? 'unknown',
          name: `${instructor?.name.first} ${instructor?.name.last}`.trim(),
          avatar: instructor?.picture?.large ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor?.login.username ?? 'U')}&background=6366f1&color=fff`,
          title: INSTRUCTOR_TITLES[idx % INSTRUCTOR_TITLES.length] ?? 'Instructor',
        },
        isBookmarked: false,
        isEnrolled: false,
      };
    });

    return {
      courses,
      hasMore: products.nextPage,
      currentPage: products.page,
      total: products.totalItems,
    };
  },
};
