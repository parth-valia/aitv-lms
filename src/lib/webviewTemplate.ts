// src/lib/webviewTemplate.ts
import { CourseWebPayload } from '@/types/course';

export function generateCourseHTML(course: CourseWebPayload, authToken?: string): string {
  // Pass auth token via global window variable to avoid header injection issues
  // The webview content uses this token for any authenticated requests it might make
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>${course.title}</title>
      <style>
        :root {
          --brand-50: #eef2ff;
          --brand-500: #6366f1;
          --brand-600: #4f46e5;
          --bg-color: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --border-color: #f1f5f9;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg-color: #0f172a;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --border-color: #1e293b;
            --brand-50: #312e81; /* Dark brand tint */
          }
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-primary);
          margin: 0;
          padding: 24px 20px 100px 20px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        .header {
          margin-bottom: 24px;
        }

        .category {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: var(--brand-600);
          background-color: var(--brand-50);
          padding: 4px 10px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        h1 {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 16px 0;
          line-height: 1.3;
        }

        .stats-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .instructor-card {
          display: flex;
          align-items: center;
          padding: 16px;
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          margin-bottom: 32px;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 24px;
          margin-right: 16px;
        }

        .instructor-role {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
          margin: 0;
        }

        .instructor-name {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 2px 0 0 0;
        }

        .content-section {
          margin-bottom: 24px;
        }

        h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        p {
          margin: 0 0 16px 0;
          color: var(--text-secondary);
        }

        .module-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .module-item {
          padding: 16px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .module-item-title {
          font-weight: 600;
          font-size: 15px;
        }

        .module-item-duration {
          font-size: 13px;
          color: var(--text-secondary);
        }
      </style>
      <script>
        window.__AUTH_TOKEN__ = "${authToken || ''}";
      </script>
    </head>
    <body>
      <div class="header">
        <span class="category">${course.category}</span>
        <h1>${course.title}</h1>
        <div class="stats-row">
          <div class="stat">⭐ ${course.rating}</div>
          <div class="stat">👥 ${course.enrolledCount} learners</div>
        </div>
      </div>

      <div class="instructor-card">
        <img class="avatar" src="${course.instructor.avatar}" alt="${course.instructor.name}" />
        <div>
          <p class="instructor-role">Course Instructor</p>
          <p class="instructor-name">${course.instructor.name}</p>
        </div>
      </div>

      <div class="content-section">
        <h2>About this course</h2>
        <p>${course.description}</p>
        <p>This course is designed to take you from a beginner to an advanced level. You'll work on real-world projects, learning industry best practices from top professionals.</p>
      </div>

      <div class="content-section">
        <h2>Curriculum</h2>
        <ul class="module-list" id="curriculum">
          <li class="module-item">
            <span class="module-item-title">1. Introduction & Setup</span>
            <span class="module-item-duration">12:45</span>
          </li>
          <li class="module-item">
            <span class="module-item-title">2. Core Concepts</span>
            <span class="module-item-duration">34:20</span>
          </li>
          <li class="module-item">
            <span class="module-item-title">3. Advanced Techniques</span>
            <span class="module-item-duration">45:10</span>
          </li>
          <li class="module-item" style="opacity: 0.5;">
            <span class="module-item-title">4. Final Project (Locked)</span>
            <span class="module-item-duration">--:--</span>
          </li>
        </ul>
      </div>

      <script>
        // Set up the bridge when React Native is ready
        document.addEventListener('DOMContentLoaded', () => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
          }
        });

        // Listen for messages from native (e.g. theme updates or auth token refresh)
        document.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'THEME') {
              if (data.payload.isDark) {
                document.body.style.setProperty('--bg-color', '#0f172a');
                document.body.style.setProperty('--text-primary', '#f8fafc');
                document.body.style.setProperty('--text-secondary', '#94a3b8');
                document.body.style.setProperty('--border-color', '#1e293b');
                document.body.style.setProperty('--brand-50', '#312e81');
              } else {
                document.body.style.removeProperty('--bg-color');
                document.body.style.removeProperty('--text-primary');
                document.body.style.removeProperty('--text-secondary');
                document.body.style.removeProperty('--border-color');
                document.body.style.removeProperty('--brand-50');
              }
            }
          } catch (e) {
            console.error('Failed to parse message from native:', e);
          }
        });
      </script>
    </body>
    </html>
  `;
}
