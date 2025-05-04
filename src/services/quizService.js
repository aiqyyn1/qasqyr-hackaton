const API_URL = 'http://172.20.10.2:8080/api';

const mockQuizData = {
    id: 1,
    content: [
        {
            title: "What is the primary focus of the lecture titled 'Algorithm II'?",
            variants: [
                "Data Structures",
                "Dynamic Connectivity",
                "Sorting Algorithms",
                "Graph Theory"
            ],
            correctVariantIndex: 1
        },
        {
            title: "Which of the following methods is used to connect two objects in the Dynamic-Connectivity Client?",
            variants: [
                "connect()",
                "union()",
                "link()",
                "merge()",
                "join()"
            ],
            correctVariantIndex: [1, 2]
        },
        {
            title: "Match the following terms with their definitions:",
            variants: [
                "Quick-Union",
                "Quick-Find",
                "Dynamic Connectivity",
                "Union-Find"
            ],
            correctVariantIndex: [0, 1, 2, 3],
            matchWith: [
                "A method to connect components using tree structures.",
                "A method to find components using an array.",
                "A system to manage connections between objects dynamically.",
                "A data structure that supports union and find operations."
            ]
        }
    ]
};

export const quizService = {
    getQuiz: async (quizId) => {
        try {
            const token = localStorage.getItem('auth_tokens');
            if (!token) {
                throw new Error('No auth token found');
            }

            const { access_token } = JSON.parse(token);
            
            const response = await fetch(`${API_URL}/modules/topics/${quizId}/generate-quiz`, {
                headers: {
                    'Accept-Language': 'RU',
                    'Authorization': `Bearer ${access_token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized. Please login again.');
                }
                throw new Error('Failed to fetch quiz');
            }
            
            const data = await response.json();
            
            // Transform the API response to match the expected format
            const quizData = {
                id: quizId,
                content: data.processed_json.quiz.map(question => ({
                    title: question.title,
                    variants: question.variants,
                    correctVariantIndex: question.correctVariantIndex,
                    matchWith: question.matchWith
                }))
            };
            
            return quizData;
        } catch (error) {
            console.error('Error fetching quiz:', error);
            throw error;
        }
    },

    submitQuizResults: async (quizId, results) => {
        try {
            const token = localStorage.getItem('auth_tokens');
            if (!token) {
                throw new Error('No auth token found');
            }

            const { access_token } = JSON.parse(token);

            const response = await fetch(`${API_URL}/modules/topics/${quizId}/pass`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized. Please login again.');
                }
                throw new Error('Failed to submit quiz results');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting quiz results:', error);
            throw error;
        }
    }
}; 