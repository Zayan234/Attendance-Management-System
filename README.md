# Attendance Management System

A comprehensive attendance management system built with Next.js, Prisma, and TypeScript.

## Features

- Employee attendance tracking
- Admin dashboard with analytics
- Department management
- Reporting tools
- User authentication and role-based access control

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/attendance-system.git
cd attendance-system
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Set up the database
\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

4. Seed the database with initial data
\`\`\`bash
npm run prisma:seed
# or
yarn prisma:seed
\`\`\`

5. Start the development server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login Credentials

- Admin:
  - Email: admin@example.com
  - Password: admin123

- Employee:
  - Email: john.doe@example.com
  - Password: password

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - React components
- `/lib` - Utility functions and hooks
- `/prisma` - Prisma schema and migrations
- `/public` - Static assets
- `/styles` - Global styles

## Testing

\`\`\`bash
npm run test
# or
yarn test
\`\`\`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
