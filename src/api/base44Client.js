import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

// Helper to handle entity operations via fetch
const createEntityHandler = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || "/api";
  
  return {
    filter: async (query = {}) => {
      const url = new URL(`${baseUrl}/${endpoint}`);
      Object.keys(query).forEach(key => {
        if (query[key] !== undefined && query[key] !== null) {
          url.searchParams.append(key, query[key]);
        }
      });
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
    get: async (id) => {
      const res = await fetch(`${baseUrl}/${endpoint}/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`${baseUrl}/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id) => {
      await fetch(`${baseUrl}/${endpoint}/${id}`, { method: 'DELETE' });
    }
  };
};

// Generate mock assessment questions based on course title
function generateMockQuestions(courseTitle) {
  const questionSets = {
    "Introduction to React": [
      {
        question: "What is JSX in React?",
        options: {
          a: "A JavaScript framework",
          b: "A syntax extension for JavaScript",
          c: "A CSS preprocessor",
          d: "A database query language"
        },
        correct: "b"
      },
      {
        question: "Which method is used to update state in a React class component?",
        options: {
          a: "this.setState()",
          b: "this.updateState()",
          c: "this.changeState()",
          d: "this.modifyState()"
        },
        correct: "a"
      },
      {
        question: "What is the purpose of the useEffect hook?",
        options: {
          a: "To manage component state",
          b: "To handle side effects in functional components",
          c: "To create event handlers",
          d: "To define component props"
        },
        correct: "b"
      },
      {
        question: "Which of the following is NOT a React hook?",
        options: {
          a: "useState",
          b: "useEffect",
          c: "useContext",
          d: "useRouter"
        },
        correct: "d"
      },
      {
        question: "What does the 'key' prop do in React lists?",
        options: {
          a: "Styles the list items",
          b: "Helps React identify which items have changed",
          c: "Sets the background color",
          d: "Defines the list order"
        },
        correct: "b"
      },
      {
        question: "What is the virtual DOM in React?",
        options: {
          a: "A direct copy of the real DOM",
          b: "A lightweight representation of the real DOM",
          c: "A database for React components",
          d: "A styling system for React"
        },
        correct: "b"
      },
      {
        question: "Which lifecycle method is called after a component renders for the first time?",
        options: {
          a: "componentWillMount",
          b: "componentDidMount",
          c: "componentWillUpdate",
          d: "componentDidUpdate"
        },
        correct: "b"
      },
      {
        question: "What is prop drilling in React?",
        options: {
          a: "A way to pass props through multiple component levels",
          b: "A method to drill holes in components",
          c: "A debugging technique",
          d: "A state management pattern"
        },
        correct: "a"
      },
      {
        question: "Which hook is used for performance optimization in React?",
        options: {
          a: "useMemo",
          b: "useCallback",
          c: "useReducer",
          d: "Both a and b"
        },
        correct: "d"
      },
      {
        question: "What is the purpose of React.Fragment?",
        options: {
          a: "To create animations",
          b: "To group multiple elements without adding extra DOM nodes",
          c: "To handle form inputs",
          d: "To manage component state"
        },
        correct: "b"
      },
      {
        question: "Which of these is NOT a valid way to create a React component?",
        options: {
          a: "Function component",
          b: "Class component",
          c: "Arrow function component",
          d: "String component"
        },
        correct: "d"
      },
      {
        question: "What does the 'children' prop represent in React?",
        options: {
          a: "Component state",
          b: "Component props",
          c: "Elements nested inside the component",
          d: "Component lifecycle methods"
        },
        correct: "c"
      },
      {
        question: "Which method is used to prevent re-rendering in React?",
        options: {
          a: "shouldComponentUpdate",
          b: "React.memo",
          c: "useMemo",
          d: "All of the above"
        },
        correct: "d"
      },
      {
        question: "What is the purpose of the 'ref' attribute in React?",
        options: {
          a: "To reference DOM elements directly",
          b: "To pass data between components",
          c: "To style components",
          d: "To handle events"
        },
        correct: "a"
      },
      {
        question: "Which hook would you use to manage complex state logic?",
        options: {
          a: "useState",
          b: "useEffect",
          c: "useReducer",
          d: "useContext"
        },
        correct: "c"
      },
      {
        question: "What is the main benefit of using React?",
        options: {
          a: "Fast rendering with virtual DOM",
          b: "Built-in database integration",
          c: "Automatic CSS generation",
          d: "Server-side rendering only"
        },
        correct: "a"
      },
      {
        question: "Which of these is NOT a React core principle?",
        options: {
          a: "Declarative programming",
          b: "Component-based architecture",
          c: "Unidirectional data flow",
          d: "Two-way data binding"
        },
        correct: "d"
      },
      {
        question: "What is the purpose of the 'key' prop in lists?",
        options: {
          a: "To style list items",
          b: "To help React track item changes for efficient updates",
          c: "To set item order",
          d: "To add animations"
        },
        correct: "b"
      },
      {
        question: "Which hook is used for side effects in functional components?",
        options: {
          a: "useState",
          b: "useEffect",
          c: "useContext",
          d: "useReducer"
        },
        correct: "b"
      },
      {
        question: "What is JSX transpiled to?",
        options: {
          a: "HTML",
          b: "JavaScript function calls",
          c: "CSS",
          d: "JSON"
        },
        correct: "b"
      },
      {
        question: "Which method is used to handle form submissions in React?",
        options: {
          a: "onSubmit",
          b: "onClick",
          c: "onChange",
          d: "onInput"
        },
        correct: "a"
      },
      {
        question: "What is the purpose of the 'defaultProps' in class components?",
        options: {
          a: "To set default state values",
          b: "To define default prop values",
          c: "To handle errors",
          d: "To manage lifecycle"
        },
        correct: "b"
      },
      {
        question: "Which of these is a controlled component in React?",
        options: {
          a: "A component with its own state",
          b: "A component controlled by React state",
          c: "A component with no props",
          d: "A component with only functions"
        },
        correct: "b"
      },
      {
        question: "What does 'lifting state up' mean in React?",
        options: {
          a: "Moving state to a higher component in the tree",
          b: "Increasing component performance",
          c: "Adding more state variables",
          d: "Using global state"
        },
        correct: "a"
      },
      {
        question: "Which hook is used for accessing context in functional components?",
        options: {
          a: "useState",
          b: "useEffect",
          c: "useContext",
          d: "useReducer"
        },
        correct: "c"
      }
    ],
    "Advanced JavaScript": [
      {
        question: "What is a closure in JavaScript?",
        options: {
          a: "A way to close browser windows",
          b: "A function that has access to variables in its outer scope",
          c: "A method to end loops",
          d: "A type of error handling"
        },
        correct: "b"
      },
      {
        question: "Which of these is NOT a primitive data type in JavaScript?",
        options: {
          a: "string",
          b: "number",
          c: "boolean",
          d: "object"
        },
        correct: "d"
      },
      {
        question: "What does the '===' operator do?",
        options: {
          a: "Assignment",
          b: "Loose equality comparison",
          c: "Strict equality comparison",
          d: "Not equal comparison"
        },
        correct: "c"
      },
      {
        question: "What is the purpose of the 'async' keyword?",
        options: {
          a: "To make functions run faster",
          b: "To declare asynchronous functions",
          c: "To create loops",
          d: "To define variables"
        },
        correct: "b"
      },
      {
        question: "Which method is used to parse JSON strings?",
        options: {
          a: "JSON.parse()",
          b: "JSON.stringify()",
          c: "JSON.convert()",
          d: "JSON.decode()"
        },
        correct: "a"
      },
      {
        question: "What is the event loop in JavaScript?",
        options: {
          a: "A loop that handles events",
          b: "A mechanism for handling asynchronous operations",
          c: "A way to iterate over arrays",
          d: "A debugging tool"
        },
        correct: "b"
      },
      {
        question: "Which of these is NOT a valid way to declare a variable in JavaScript?",
        options: {
          a: "var",
          b: "let",
          c: "const",
          d: "variable"
        },
        correct: "d"
      },
      {
        question: "What is the purpose of the 'bind' method?",
        options: {
          a: "To concatenate strings",
          b: "To set the 'this' context of a function",
          c: "To create new objects",
          d: "To handle errors"
        },
        correct: "b"
      },
      {
        question: "Which method is used to add elements to the end of an array?",
        options: {
          a: "push()",
          b: "pop()",
          c: "shift()",
          d: "unshift()"
        },
        correct: "a"
      },
      {
        question: "What is a Promise in JavaScript?",
        options: {
          a: "A guarantee that something will happen",
          b: "An object representing the eventual completion of an async operation",
          c: "A type of loop",
          d: "A debugging tool"
        },
        correct: "b"
      },
      {
        question: "Which operator is used for optional chaining?",
        options: {
          a: "?.",
          b: "?",
          c: ":",
          d: "::"
        },
        correct: "a"
      },
      {
        question: "What does 'hoisting' mean in JavaScript?",
        options: {
          a: "Moving variables to the top of their scope",
          b: "Creating global variables",
          c: "Handling errors",
          d: "Optimizing performance"
        },
        correct: "a"
      },
      {
        question: "Which method is used to convert an object to a JSON string?",
        options: {
          a: "JSON.parse()",
          b: "JSON.stringify()",
          c: "Object.toString()",
          d: "String.convert()"
        },
        correct: "b"
      },
      {
        question: "What is the 'this' keyword in JavaScript?",
        options: {
          a: "A reference to the current function",
          b: "A reference to the current object context",
          c: "A type of variable",
          d: "A loop construct"
        },
        correct: "b"
      },
      {
        question: "Which of these is a higher-order function?",
        options: {
          a: "map()",
          b: "forEach()",
          c: "filter()",
          d: "All of the above"
        },
        correct: "d"
      },
      {
        question: "What is the purpose of the 'spread' operator (...)?",
        options: {
          a: "To spread arrays into individual elements",
          b: "To create new arrays",
          c: "To handle errors",
          d: "Both a and b"
        },
        correct: "d"
      },
      {
        question: "Which statement is used to handle exceptions in JavaScript?",
        options: {
          a: "try...catch",
          b: "if...else",
          c: "switch...case",
          d: "for...in"
        },
        correct: "a"
      },
      {
        question: "What is the difference between '==' and '==='?",
        options: {
          a: "No difference",
          b: "'===' checks both value and type",
          c: "'==' is for strings only",
          d: "'===' is for numbers only"
        },
        correct: "b"
      },
      {
        question: "Which method is used to remove the last element from an array?",
        options: {
          a: "push()",
          b: "pop()",
          c: "shift()",
          d: "unshift()"
        },
        correct: "b"
      },
      {
        question: "What is a callback function?",
        options: {
          a: "A function that calls itself",
          b: "A function passed as an argument to another function",
          c: "A function that returns a value",
          d: "A function that handles errors"
        },
        correct: "b"
      },
      {
        question: "Which of these creates an immutable copy of an array?",
        options: {
          a: "array.copy()",
          b: "array.slice()",
          c: "array.clone()",
          d: "array.duplicate()"
        },
        correct: "b"
      },
      {
        question: "What is the purpose of 'use strict' in JavaScript?",
        options: {
          a: "To make code run faster",
          b: "To enforce stricter parsing and error handling",
          c: "To enable new features",
          d: "To disable warnings"
        },
        correct: "b"
      },
      {
        question: "Which method is used to merge two or more arrays?",
        options: {
          a: "array.join()",
          b: "array.concat()",
          c: "array.merge()",
          d: "array.combine()"
        },
        correct: "b"
      },
      {
        question: "What is the 'prototype' in JavaScript?",
        options: {
          a: "A built-in object",
          b: "A mechanism for object inheritance",
          c: "A type of function",
          d: "A debugging tool"
        },
        correct: "b"
      },
      {
        question: "Which operator is used for nullish coalescing?",
        options: {
          a: "??",
          b: "?",
          c: ":",
          d: "::"
        },
        correct: "a"
      }
    ]
  };

  // Get questions for the specific course, or use a default set
  let questions = questionSets[courseTitle];
  
  if (!questions) {
    // Default questions for unknown courses - expanded to 25 unique questions
    questions = [
      {
        question: `What is the main topic of "${courseTitle}"?`,
        options: {
          a: "Programming concepts",
          b: "Web development",
          c: "Data structures",
          d: "All of the above"
        },
        correct: "d"
      },
      {
        question: "Which of these is a best practice in programming?",
        options: {
          a: "Writing clear, readable code",
          b: "Using meaningful variable names",
          c: "Adding comments to explain complex logic",
          d: "All of the above"
        },
        correct: "d"
      },
      {
        question: "What should you do when you encounter a bug?",
        options: {
          a: "Ignore it and continue",
          b: "Debug systematically",
          c: "Rewrite the entire code",
          d: "Ask someone else to fix it"
        },
        correct: "b"
      },
      {
        question: "Why is version control important?",
        options: {
          a: "It makes code look better",
          b: "It tracks changes and allows collaboration",
          c: "It speeds up compilation",
          d: "It reduces file size"
        },
        correct: "b"
      },
      {
        question: "What is refactoring?",
        options: {
          a: "Rewriting code from scratch",
          b: "Improving code structure without changing functionality",
          c: "Adding new features",
          d: "Removing code"
        },
        correct: "b"
      },
      {
        question: "What is the purpose of testing in software development?",
        options: {
          a: "To make the code run slower",
          b: "To ensure code quality and catch bugs early",
          c: "To increase file size",
          d: "To confuse other developers"
        },
        correct: "b"
      },
      {
        question: "Which of these is NOT a programming paradigm?",
        options: {
          a: "Object-oriented programming",
          b: "Functional programming",
          c: "Procedural programming",
          d: "Colorful programming"
        },
        correct: "d"
      },
      {
        question: "What is an algorithm?",
        options: {
          a: "A type of computer hardware",
          b: "A step-by-step procedure to solve a problem",
          c: "A programming language",
          d: "A database system"
        },
        correct: "b"
      },
      {
        question: "Why is code documentation important?",
        options: {
          a: "It makes files larger",
          b: "It helps other developers understand the code",
          c: "It slows down the application",
          d: "It replaces testing"
        },
        correct: "b"
      },
      {
        question: "What is the purpose of code reviews?",
        options: {
          a: "To criticize developers",
          b: "To improve code quality and share knowledge",
          c: "To delay project completion",
          d: "To assign blame for bugs"
        },
        correct: "b"
      },
      {
        question: "Which of these is a benefit of modular programming?",
        options: {
          a: "Makes code harder to maintain",
          b: "Increases code complexity",
          c: "Improves code reusability and maintainability",
          d: "Slows down development"
        },
        correct: "c"
      },
      {
        question: "What is debugging?",
        options: {
          a: "Writing new code",
          b: "Finding and fixing errors in code",
          c: "Designing user interfaces",
          d: "Creating databases"
        },
        correct: "b"
      },
      {
        question: "Why should you avoid code duplication?",
        options: {
          a: "It makes code look shorter",
          b: "It leads to maintenance issues and inconsistencies",
          c: "It improves performance",
          d: "It makes code more readable"
        },
        correct: "b"
      },
      {
        question: "What is the purpose of comments in code?",
        options: {
          a: "To make the code run faster",
          b: "To explain what the code does for future reference",
          c: "To increase file size",
          d: "To confuse other developers"
        },
        correct: "b"
      },
      {
        question: "Which of these is NOT a good variable naming practice?",
        options: {
          a: "Using descriptive names",
          b: "Using camelCase for variables",
          c: "Using single letters like 'x' or 'y'",
          d: "Using underscores for constants"
        },
        correct: "c"
      },
      {
        question: "What is the importance of error handling?",
        options: {
          a: "To make applications crash",
          b: "To provide graceful failure and user feedback",
          c: "To ignore problems",
          d: "To slow down applications"
        },
        correct: "b"
      },
      {
        question: "Why is code optimization important?",
        options: {
          a: "To make code more complex",
          b: "To improve performance and efficiency",
          c: "To increase development time",
          d: "To make code harder to read"
        },
        correct: "b"
      },
      {
        question: "What is the purpose of version control systems?",
        options: {
          a: "To control who can use the computer",
          b: "To track and manage changes to code over time",
          c: "To limit file access",
          d: "To compress code files"
        },
        correct: "b"
      },
      {
        question: "Which of these is a benefit of pair programming?",
        options: {
          a: "Reduces productivity",
          b: "Improves code quality and knowledge sharing",
          c: "Increases bugs",
          d: "Slows down development significantly"
        },
        correct: "b"
      },
      {
        question: "What is the purpose of code formatting?",
        options: {
          a: "To make code look unreadable",
          b: "To ensure consistent style and readability",
          c: "To change code functionality",
          d: "To compress code"
        },
        correct: "b"
      },
      {
        question: "Why should you write maintainable code?",
        options: {
          a: "To make it harder for others to work with",
          b: "To make future changes easier and less error-prone",
          c: "To increase technical debt",
          d: "To confuse new team members"
        },
        correct: "b"
      },
      {
        question: "What is the importance of code modularity?",
        options: {
          a: "Makes code monolithic",
          b: "Allows for easier testing and maintenance",
          c: "Increases coupling between components",
          d: "Makes code less reusable"
        },
        correct: "b"
      },
      {
        question: "Which of these is NOT a testing type?",
        options: {
          a: "Unit testing",
          b: "Integration testing",
          c: "Performance testing",
          d: "Confusion testing"
        },
        correct: "d"
      },
      {
        question: "What is the purpose of code standards?",
        options: {
          a: "To restrict creativity",
          b: "To ensure consistency across a codebase",
          c: "To make code less efficient",
          d: "To increase development time"
        },
        correct: "b"
      },
      {
        question: "Why is continuous learning important for developers?",
        options: {
          a: "Technology never changes",
          b: "To keep up with evolving technologies and best practices",
          c: "To make current knowledge obsolete",
          d: "To avoid learning new things"
        },
        correct: "b"
      }
    ];
  }

  // Return all available questions (up to 25) without duplication
  return questions.slice(0, 25).map((q, index) => ({
    ...q,
    question: `${index + 1}. ${q.question}`
  }));
}

// Mock Base44 client for local development
class MockBase44Client {
  constructor() {
    this.auth = {
      me: async () => {
        const storedUser = localStorage.getItem('base44_user');
        if (storedUser) return JSON.parse(storedUser);
        return {
          id: 'local-user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student'
        };
      },
      logout: (redirectUrl) => {
        localStorage.removeItem('base44_user');
        if (redirectUrl) window.location.href = redirectUrl;
        else window.location.reload();
      },
      redirectToLogin: (redirectUrl) => {
        window.location.reload();
      },
      updateMe: async (updates) => {
        const me = await this.auth.me();
        const updatedUser = { ...me, ...updates };
        localStorage.setItem('base44_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    };

    this.entities = {
      Course: createEntityHandler('courses'),
      Session: createEntityHandler('sessions'),
      Assessment: createEntityHandler('assessments'),
      CreditTransaction: createEntityHandler('creditTransactions'),
      Slot: createEntityHandler('slots')
    };

    this.integrations = {
      Core: {
        InvokeLLM: async (params) => {
          const courseTitle = params.prompt.match(/"([^"]+)"/)?.[1] || "General Programming";
          const questions = generateMockQuestions(courseTitle);
          return { questions };
        },
        UploadFile: async (params) => {
          return { file_url: `https://example.com/files/${Date.now()}.pdf` };
        }
      }
    };
  }
}

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Use mock client for local development, real client for production
export const base44 = new MockBase44Client();