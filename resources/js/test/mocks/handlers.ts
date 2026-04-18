import { http, HttpResponse } from 'msw';
export const handlers = [
    // Auth-related API endpoints
    http.get('/api/user', () => {
        return HttpResponse.json({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        });
    }),
    // Login endpoint
    http.post('/login', () => {
        return HttpResponse.json({
            message: 'Login successful',
        });
    }),
    // Logout endpoint
    http.post('/logout', () => {
        return HttpResponse.json({
            message: 'Logout successful',
        });
    }),
    // Quiz Builder API endpoints
    http.post('/teaching/trainingUnits/:trainingUnitId/quiz', ({ params }) => {
        return HttpResponse.json({
            quiz: {
                id: 'quiz-1',
                title: 'Test Quiz',
                description: 'A test quiz',
                training_unit_id: params.trainingUnitId,
                passing_score: 80,
                time_limit_minutes: 30,
                max_attempts: 3,
                shuffle_questions: false,
                shuffle_options: false,
                show_correct_answers: true,
                is_published: false,
                questions: [],
            },
        });
    }),
    http.patch('/teaching/quizzes/:quizId', ({ params, request: _request }) => {
        return HttpResponse.json({
            quiz: {
                id: params.quizId,
                title: 'Updated Quiz',
                description: 'Updated description',
                training_unit_id: 'trainingUnit-1',
                passing_score: 80,
                time_limit_minutes: 30,
                max_attempts: 3,
                shuffle_questions: false,
                shuffle_options: false,
                show_correct_answers: true,
                is_published: false,
                questions: [],
            },
        });
    }),
    http.delete('/teaching/quizzes/:quizId', () => {
        return HttpResponse.json({ success: true });
    }),
    http.post('/teaching/quizzes/:quizId/publish', ({ params }) => {
        return HttpResponse.json({
            quiz: {
                id: params.quizId,
                title: 'Test Quiz',
                is_published: true,
            },
        });
    }),
    http.post('/teaching/quizzes/:quizId/unpublish', ({ params }) => {
        return HttpResponse.json({
            quiz: {
                id: params.quizId,
                title: 'Test Quiz',
                is_published: false,
            },
        });
    }),
    http.post('/teaching/quizzes/:quizId/questions', ({ params }) => {
        return HttpResponse.json({
            question: {
                id: 'question-1',
                quiz_id: params.quizId,
                type: 'multiple_choice',
                question_text: 'Test question',
                points: 10,
                order: 1,
            },
        });
    }),
    http.delete('/teaching/questions/:questionId', () => {
        return HttpResponse.json({ success: true });
    }),
    http.post('/teaching/quizzes/:quizId/reorder', () => {
        return HttpResponse.json({ success: true });
    }),
    // Quiz Taker API endpoints
    http.post('/quizzes/:quizId/start', ({ params }) => {
        return HttpResponse.json({
            attempt: {
                id: 'attempt-1',
                quiz_id: params.quizId,
                started_at: new Date().toISOString(),
                status: 'in_progress',
                user_id: 'user-1',
            },
        });
    }),
    http.post('/quiz-attempts/:attemptId/submit', ({ params }) => {
        return HttpResponse.json({
            message: 'Quiz submitted successfully',
            attempt: {
                id: params.attemptId,
                status: 'completed',
                score_percentage: 85,
                total_points: 100,
                earned_points: 85,
                passed: true,
            },
            results: [
                {
                    id: 'result-1',
                    question_id: 'question-1',
                    is_correct: true,
                    points_earned: 10,
                    explanation: 'Correct answer explanation',
                },
            ],
        });
    }),
    // Guacamole Viewer API endpoint
    http.get('/vm-sessions/:sessionId/guacamole-token', ({ params: _params }) => {
        return HttpResponse.json({
            token: 'mock-guacamole-token-123',
            connection_id: 'conn-123',
            tunnel_url: 'ws://localhost:8080/websocket-tunnel',
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        });
    }),
    // Search API endpoints
    http.get('/search', ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('q');
        const mockResults = [
            {
                id: '1',
                type: 'trainingPath',
                title: 'React Fundamentals',
                subtitle: 'Smart Manufacturing',
                description: 'Learn React from scratch',
                url: '/trainingPaths/1',
            },
            {
                id: '2',
                type: 'trainingUnit',
                title: 'Introduction to JSX',
                subtitle: 'React Fundamentals',
                description: 'Understanding JSX syntax',
                url: '/trainingPaths/1/trainingUnits/1',
            },
        ];
        if (query && query.length > 0) {
            return HttpResponse.json({
                results: mockResults,
                total: 2,
                query,
                filters: {},
                sort: 'relevance',
                categories: [],
            });
        }
        return HttpResponse.json({
            results: [],
            total: 0,
            query: '',
            filters: {},
            sort: 'relevance',
            categories: [],
        });
    }),
    http.get('/search/suggest', ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('q');
        const mockSuggestions = [
            { query: 'react', type: 'trending' },
            { query: 'javascript', type: 'recent' },
            { query: 'typescript', type: 'suggested' },
        ];
        return HttpResponse.json({
            suggestions: query ? mockSuggestions : [],
        });
    }),
    http.get('/search/recent', () => {
        return HttpResponse.json({
            searches: ['javascript', 'react hooks', 'css grid'],
        });
    }),
    http.get('/search/trending', () => {
        return HttpResponse.json({
            trending: ['react', 'typescript', 'node.js'],
        });
    }),
    // Notification API endpoints
    http.get('/notifications/recent', ({ request }) => {
        const url = new URL(request.url);
        const limit = url.searchParams.get('limit');
        const mockNotifications = [
            {
                id: '1',
                type: 'training_path_approved',
                title: 'TrainingPath Approved',
                message: 'Your trainingPath "React Basics" has been approved',
                link: '/trainingPaths/1',
                read: false,
                created_at: '2024-01-15T10:00:00Z',
                data: { training_path_id: 1 },
            },
            {
                id: '2',
                type: 'new_enrollment',
                title: 'New Student Enrolled',
                message: 'John Doe enrolled in your trainingPath',
                link: '/trainingPaths/1/students',
                read: false,
                created_at: '2024-01-15T09:00:00Z',
            },
            {
                id: '3',
                type: 'forum_reply',
                title: 'New Forum Reply',
                message: 'Someone replied to your forum post',
                link: '/forum/posts/123',
                read: true,
                created_at: '2024-01-14T15:00:00Z',
            },
        ];
        return HttpResponse.json({
            notifications: mockNotifications.slice(0, Number(limit) || 10),
            unread_count: mockNotifications.filter(n => !n.read).length,
        });
    }),
    http.get('/notifications/unread-count', () => {
        return HttpResponse.json({
            count: 2, // Default unread count for tests
        });
    }),
    http.post('/notifications/:id/read', ({ params }) => {
        const mockNotification = {
            id: params.id,
            type: 'training_path_approved',
            title: 'TrainingPath Approved',
            message: 'Your trainingPath "React Basics" has been approved',
            link: '/trainingPaths/1',
            read: true,
            created_at: '2024-01-15T10:00:00Z',
        };
        return HttpResponse.json({ notification: mockNotification });
    }),
    http.post('/notifications/mark-all-read', () => {
        return HttpResponse.json({
            marked_count: 2,
            unread_count: 0,
        });
    }),
];

