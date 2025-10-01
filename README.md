# Chat App

This is a chat application built with Node.js, NestJS, Prisma, Redis, Postgres, Docker, and Docker Compose.

## Prerequisites

* Node.js 18+
* pnpm 10.17.1 (npm install -g pnpm@10.17.1)
* Docker and Docker Compose

## Setup

1. Clone the repository:

   git clone [<repo-url>](https://github.com/Ezmad-Ze/chat-app.git)

2. Install dependencies:

   npm install

3. Start Docker containers (Postgres, Redis):

   docker-compose up -d

4. Run Prisma migrations:

   cd apps/api
   npx prisma migrate dev --name init
   cd ../

5. Start dev servers:

   npm turbo run dev


