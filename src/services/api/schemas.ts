// src/services/api/schemas.ts
import { z } from 'zod';

export const UserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string().email(),
  avatar: z.object({ url: z.string() }).nullable().optional(),
  createdAt: z.string(),
});

export const ProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  mainImage: z.object({ url: z.string() }).optional(),
  category: z.string().optional(),
});

export const PublicProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  thumbnail: z.string(),
  images: z.array(z.string()).optional(),
});

export const PublicUserSchema = z.object({
  id: z.number(),
  name: z.object({
    first: z.string(),
    last: z.string(),
  }),
  picture: z.object({
    large: z.string(),
    medium: z.string(),
    thumbnail: z.string(),
  }),
  login: z.object({
    username: z.string(),
  }),
  email: z.string(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    statusCode: z.number(),
    data: z.object({
      data: z.array(itemSchema),
      totalItems: z.number(),
      limit: z.number(),
      page: z.number(),
      totalPages: z.number(),
      nextPage: z.boolean(),
      previousPage: z.boolean(),
    }),
    message: z.string(),
    success: z.boolean(),
  });

export const AuthResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    user: UserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  message: z.string(),
  success: z.boolean(),
});
