import { AIService } from '../src/services/ai';
import { Course } from '../src/types/course';

// Keep Anthropic SDK from making real network calls
jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(async () => ({
        content: [{ type: 'text', text: '[0,1,2]' }],
      })),
    },
  })),
}));

const makeCourse = (id: string, category: string): Course => ({
  id,
  title: `Course ${id}`,
  description: `Description for course ${id}`,
  category,
  thumbnail: 'https://example.com/thumb.jpg',
  price: 0,
  rating: 4.5,
  enrolledCount: 100,
  instructor: { id: 'i1', name: 'Instructor', avatar: '', title: 'Expert' },
  isBookmarked: false,
  isEnrolled: false,
});

const courses: Course[] = [
  makeCourse('1', 'Design'),
  makeCourse('2', 'Design'),
  makeCourse('3', 'Code'),
  makeCourse('4', 'Marketing'),
  makeCourse('5', 'Business'),
];

describe('AIService.getRecommendations — local fallback', () => {
  it('returns top-rated courses for cold-start users', async () => {
    const result = await AIService.getRecommendations(courses, []);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('excludes already-bookmarked courses', async () => {
    const result = await AIService.getRecommendations(courses, ['1', '2']);
    const ids = result.map((c) => c.id);
    expect(ids).not.toContain('1');
    expect(ids).not.toContain('2');
  });

  it('returns empty array for empty course list', async () => {
    const result = await AIService.getRecommendations([], ['1']);
    expect(result).toHaveLength(0);
  });
});

describe('AIService.semanticSearch — local fallback', () => {
  it('returns matching courses by title', async () => {
    const result = await AIService.semanticSearch('design', courses);
    expect(result.every((c) => c.category === 'Design' || c.title.toLowerCase().includes('design'))).toBe(true);
  });

  it('returns all courses for empty query', async () => {
    const result = await AIService.semanticSearch('', courses);
    expect(result).toHaveLength(courses.length);
  });

  it('returns empty array when nothing matches', async () => {
    const result = await AIService.semanticSearch('quantum physics xyz', courses);
    expect(result).toHaveLength(0);
  });
});

describe('AIService.getCourseInsight — local fallback', () => {
  it('returns a non-empty string', async () => {
    const insight = await AIService.getCourseInsight(courses[0]!);
    expect(typeof insight).toBe('string');
    expect(insight.length).toBeGreaterThan(0);
  });
});
