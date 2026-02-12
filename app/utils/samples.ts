/**
 * Sample JSON data for testing
 * No external data - all samples are hardcoded for security
 */

export const sampleData = {
    simple: {
        name: 'Simple Object',
        data: JSON.stringify({
            name: 'John Doe',
            age: 30,
            email: 'john@example.com',
            active: true
        }, null, 2)
    },

    array: {
        name: 'Array of Objects',
        data: JSON.stringify([
            { id: 1, name: 'Alice', role: 'Developer' },
            { id: 2, name: 'Bob', role: 'Designer' },
            { id: 3, name: 'Charlie', role: 'Manager' }
        ], null, 2)
    },

    nested: {
        name: 'Nested Structure',
        data: JSON.stringify({
            user: {
                id: 1,
                profile: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    contact: {
                        email: 'jane@example.com',
                        phone: '+1234567890'
                    }
                },
                preferences: {
                    theme: 'dark',
                    notifications: true,
                    language: 'en'
                }
            },
            metadata: {
                created: '2024-01-01T00:00:00Z',
                updated: '2024-01-15T12:30:00Z'
            }
        }, null, 2)
    },

    complex: {
        name: 'Complex Data',
        data: JSON.stringify({
            company: 'Tech Corp',
            employees: [
                {
                    id: 1,
                    name: 'Alice Johnson',
                    department: 'Engineering',
                    skills: ['JavaScript', 'TypeScript', 'React'],
                    projects: [
                        { name: 'Project A', status: 'active', progress: 75 },
                        { name: 'Project B', status: 'completed', progress: 100 }
                    ]
                },
                {
                    id: 2,
                    name: 'Bob Williams',
                    department: 'Design',
                    skills: ['UI/UX', 'Figma', 'Photoshop'],
                    projects: [
                        { name: 'Project C', status: 'active', progress: 50 }
                    ]
                }
            ],
            departments: {
                engineering: { budget: 500000, headcount: 25 },
                design: { budget: 200000, headcount: 10 },
                marketing: { budget: 300000, headcount: 15 }
            },
            metadata: {
                version: '1.0.0',
                lastUpdated: '2024-02-12T19:00:00Z',
                tags: ['production', 'verified']
            }
        }, null, 2)
    }
};

export type SampleKey = keyof typeof sampleData;

export function getSample(key: SampleKey): string {
    return sampleData[key].data;
}

export function getAllSamples(): Array<{ key: SampleKey; name: string }> {
    return Object.entries(sampleData).map(([key, value]) => ({
        key: key as SampleKey,
        name: value.name
    }));
}
