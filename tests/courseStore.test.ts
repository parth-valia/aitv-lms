import { act, renderHook } from '@testing-library/react-native';
import { useCourseStore } from '../src/store/courseStore';
import { notificationService } from '../src/services/notifications/notificationService';

jest.mock('../src/services/notifications/notificationService', () => ({
  notificationService: {
    scheduleBookmarkMilestone: jest.fn(),
  },
}));

const reset = () =>
  act(() => {
    useCourseStore.setState({ bookmarks: [], enrollments: [], progress: {} });
  });

describe('CourseStore — bookmarks', () => {
  beforeEach(() => {
    reset();
    jest.clearAllMocks();
  });

  it('adds a bookmark', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => result.current.toggleBookmark('c1'));
    expect(result.current.bookmarks).toContain('c1');
  });

  it('removes a bookmark on second toggle', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => {
      result.current.toggleBookmark('c1');
      result.current.toggleBookmark('c1');
    });
    expect(result.current.bookmarks).not.toContain('c1');
  });

  it('fires milestone notification at 5 bookmarks', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => {
      ['1', '2', '3', '4', '5'].forEach((id) => result.current.toggleBookmark(id));
    });
    expect(notificationService.scheduleBookmarkMilestone).toHaveBeenCalledWith(5);
  });

  it('fires milestone notification at 10 bookmarks', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => {
      Array.from({ length: 10 }, (_, i) => String(i + 1)).forEach((id) =>
        result.current.toggleBookmark(id)
      );
    });
    expect(notificationService.scheduleBookmarkMilestone).toHaveBeenCalledWith(10);
  });

  it('does not fire notification before 5 bookmarks', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => {
      ['1', '2', '3', '4'].forEach((id) => result.current.toggleBookmark(id));
    });
    expect(notificationService.scheduleBookmarkMilestone).not.toHaveBeenCalled();
  });

  it('isBookmarked returns correct state', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => result.current.toggleBookmark('c1'));
    expect(result.current.isBookmarked('c1')).toBe(true);
    expect(result.current.isBookmarked('c2')).toBe(false);
  });
});

describe('CourseStore — enrollments', () => {
  beforeEach(reset);

  it('enrolls a course', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => result.current.enroll('c1'));
    expect(result.current.enrollments).toContain('c1');
  });

  it('does not enroll the same course twice', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => {
      result.current.enroll('c1');
      result.current.enroll('c1');
    });
    expect(result.current.enrollments.filter((id) => id === 'c1')).toHaveLength(1);
  });

  it('isEnrolled returns correct state', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => result.current.enroll('c1'));
    expect(result.current.isEnrolled('c1')).toBe(true);
    expect(result.current.isEnrolled('c2')).toBe(false);
  });
});

describe('CourseStore — progress', () => {
  beforeEach(reset);

  it('updates progress for a course', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => result.current.updateProgress('c1', 75));
    expect(result.current.getProgress('c1')).toBe(75);
  });

  it('returns 0 for courses with no progress', () => {
    const { result } = renderHook(() => useCourseStore());
    expect(result.current.getProgress('unknown')).toBe(0);
  });

  it('overwrites previous progress value', () => {
    const { result } = renderHook(() => useCourseStore());
    act(() => {
      result.current.updateProgress('c1', 40);
      result.current.updateProgress('c1', 90);
    });
    expect(result.current.getProgress('c1')).toBe(90);
  });
});
