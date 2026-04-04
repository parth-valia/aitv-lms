import Anthropic from '@anthropic-ai/sdk';
import { Course } from '@/types/course';

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
});

/**
 * AI Service powered by Claude.
 * Falls back gracefully if no API key is set.
 */
export const AIService = {
  /**
   * Smart recommendations using Claude to reason about user intent
   * from their bookmarks and enrollment history.
   */
  getRecommendations: async (
    allCourses: Course[],
    userBookmarks: string[],
    userEnrollments: string[] = []
  ): Promise<Course[]> => {
    if (allCourses.length === 0) return [];

    // No API key — fall back to content-based filtering
    if (!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
      return _localRecommend(allCourses, userBookmarks);
    }

    const bookmarkedCourses = allCourses.filter((c) => userBookmarks.includes(c.id));
    const enrolledCourses = allCourses.filter((c) => userEnrollments.includes(c.id));
    const unseenCourses = allCourses.filter(
      (c) => !userBookmarks.includes(c.id) && !userEnrollments.includes(c.id)
    );

    if (unseenCourses.length === 0) return allCourses.slice(0, 3);

    const userContext =
      bookmarkedCourses.length > 0 || enrolledCourses.length > 0
        ? `Bookmarked: ${bookmarkedCourses.map((c) => `"${c.title}" (${c.category})`).join(', ')}. ` +
          `Enrolled: ${enrolledCourses.map((c) => `"${c.title}" (${c.category})`).join(', ')}.`
        : 'New user, no history yet.';

    const catalog = unseenCourses
      .slice(0, 20)
      .map((c, i) => `${i}: [${c.category}] ${c.title} — ${c.description?.slice(0, 60)}`)
      .join('\n');

    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 64,
        messages: [
          {
            role: 'user',
            content:
              `User learning profile: ${userContext}\n\n` +
              `Course catalog (index: title):\n${catalog}\n\n` +
              `Reply with ONLY a JSON array of 3 indexes (e.g. [2,7,11]) that best match this user. No explanation.`,
          },
        ],
      });

      const raw = (message.content[0] as { type: string; text: string }).text.trim();
      const indexes: number[] = JSON.parse(raw.match(/\[[\d,\s]+\]/)?.[0] ?? '[]');
      const picked = indexes
        .filter((i) => i >= 0 && i < unseenCourses.length)
        .map((i) => unseenCourses[i])
        .filter(Boolean)
        .slice(0, 3);

      return picked.length > 0 ? picked : _localRecommend(allCourses, userBookmarks);
    } catch {
      return _localRecommend(allCourses, userBookmarks);
    }
  },

  /**
   * Semantic search — Claude understands intent behind the query,
   * not just keyword matching.
   */
  semanticSearch: async (query: string, courses: Course[]): Promise<Course[]> => {
    if (!query.trim() || courses.length === 0) return courses;

    if (!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
      return _localSearch(query, courses);
    }

    const catalog = courses
      .slice(0, 30)
      .map((c, i) => `${i}: ${c.title} — ${c.description?.slice(0, 80)}`)
      .join('\n');

    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 48,
        messages: [
          {
            role: 'user',
            content:
              `Search query: "${query}"\n\nCourses:\n${catalog}\n\n` +
              `Reply with ONLY a JSON array of up to 5 indexes matching the query intent. No explanation.`,
          },
        ],
      });

      const raw = (message.content[0] as { type: string; text: string }).text.trim();
      const indexes: number[] = JSON.parse(raw.match(/\[[\d,\s]+\]/)?.[0] ?? '[]');
      const results = indexes
        .filter((i) => i >= 0 && i < courses.length)
        .map((i) => courses[i])
        .filter(Boolean);

      return results.length > 0 ? results : _localSearch(query, courses);
    } catch {
      return _localSearch(query, courses);
    }
  },

  /**
   * Generate a concise AI insight for a course
   * (what makes it worth taking, key takeaways).
   */
  getCourseInsight: async (course: Course): Promise<string> => {
    if (!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
      return `A comprehensive ${course.category} course covering ${course.title.toLowerCase()}. Ideal for learners looking to advance their skills.`;
    }

    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        messages: [
          {
            role: 'user',
            content:
              `Course: "${course.title}" (${course.category})\nDescription: ${course.description}\n\n` +
              `Write a single sentence (max 20 words) explaining why this course stands out. Be specific, no fluff.`,
          },
        ],
      });

      return (message.content[0] as { type: string; text: string }).text.trim();
    } catch {
      return `Master ${course.category} with this highly-rated course by ${course.instructor.name}.`;
    }
  },
};

// ── Local fallbacks (no API key needed) ──────────────────────────────────────

function _localRecommend(courses: Course[], bookmarks: string[]): Course[] {
  if (bookmarks.length === 0) {
    return [...courses].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }
  const categories = courses
    .filter((c) => bookmarks.includes(c.id))
    .map((c) => c.category);
  const matched = courses.filter(
    (c) => !bookmarks.includes(c.id) && categories.includes(c.category)
  );
  return matched.length > 0 ? matched.slice(0, 3) : courses.slice(0, 3);
}

function _localSearch(query: string, courses: Course[]): Course[] {
  const q = query.toLowerCase();
  return courses.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
  );
}
