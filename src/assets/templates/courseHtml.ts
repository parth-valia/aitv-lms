export const getCourseHtml = (title: string, description: string, instructor: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
        :root {
            --brand-primary: #4c49c9;
            --text-main: #2c2f31;
            --text-secondary: #747779;
            --bg-page: #f5f7f9;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-main);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .card {
            background: white;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
        h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0 0 12px 0;
            letter-spacing: -0.5px;
        }
        .instructor {
            color: var(--brand-primary);
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 20px;
            display: block;
        }
        .description {
            color: var(--text-secondary);
            font-size: 15px;
        }
        .content-block {
            background: rgba(76, 73, 201, 0.05);
            border-left: 4px solid var(--brand-primary);
            padding: 16px;
            margin-top: 24px;
            border-radius: 4px 12px 12px 4px;
        }
        .video-stub {
            width: 100%;
            height: 200px;
            background: #000;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="card">
        <span class="instructor">Instructor: ${instructor}</span>
        <h1>${title}</h1>
        <div class="video-stub">
            [ Course Video Player Stub ]
        </div>
        <p class="description">${description}</p>
        
        <div class="content-block">
            <strong>Learning Objective:</strong>
            <p>By the end of this module, you will master the core foundations of ${title} through interactive native-to-web synchronization.</p>
        </div>
    </div>
    
    <script>
        // Bridge Communication Demo
        window.onclick = function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
        }
    </script>
</body>
</html>
`;
