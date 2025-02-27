# Prompt-Results-Evaluation: Prompt Pilot ✈

The Prompt-Results-Evaluation tool is an application for evaluating generated texts from Large Language Models (LLMs). It provides a platform to manage prompts, create test sets, and give feedback on generated content. With this tool, you can analyze and compare the results of different LLMs to make informed decisions about the quality of models and prompts.

#### Features
- **Prompt Management:** Organize and maintain your prompts.
- **Multiple LLM Integration:** Test and compare results from different language models.
- **Test Set Creation:** Define source texts (test sets) as the basis for generation.
- **Provide Feedback:** Evaluate generated content with simple feedback mechanisms to analyze quality.
- **Result Comparison:** Compare generated content from different models.

## Technical Notes

1. **Frontend** - A client-side application served via Webpack.
2. **Backend (Express Server)** - A Node.js server providing API endpoints and interacting with the database.
3. **Database (PostgreSQL + Prisma ORM)** - A PostgreSQL database managed via Prisma. Prisma serves as an ORM (Object-Relational Mapper) to simplify database interactions.

### Prerequisites

Before starting the project, ensure you have the following tools installed:

- **Node.js** (>= 18.0)
- **Yarn** (Install all dependencies using `yarn install`)
- **A PostgreSQL Database**

### Configuration

The application requires a `.env` file with the correct environment variables to connect to the database and configure other important settings.

Create a `.env` file in the root directory and add the required entries as suggested in `.env.template`. If you want to use Gemini, also add your Google Project ID in `server.js`.

### Steps to Start the Application

1. **Prepare the PostgreSQL Database:** Ensure the PostgreSQL server is running if using a local setup.
2. **Apply Database Migrations:** If not already applied, run:
   ```sh
   yarn migrate:deploy
   ```
3. **Start the Backend (Express Server):**
   ```sh
   yarn express:start
   ```
4. **Start the Frontend:**
   ```sh
   yarn start
   ```

### Authentication

This application uses internal authentication to identify users.
In this public version, a default fallback (`guest.guest@example.com`) is used if no authentication header (`x-auth-request-email`) is set.

##### Important:
If you intend to use this application, **you must implement your own authentication mechanism** to ensure users are not logged in as "guest.guest@example.com".

### Prisma Schema

If changes are made to the Prisma schema, follow these steps to apply them to the PostgreSQL database:

1. **Modify `schema.prisma`**
   - Add new models, fields, or relationships, or modify existing ones.
2. **Create a Migration:**
   ```sh
   yarn migrate:create
   ```
   - **What happens?**
     - A new migration folder is created.
     - Prisma detects schema changes and generates the corresponding SQL commands.
3. **Apply Migration to the Database:**
   ```sh
   yarn migrate:deploy
   ```
   - **What happens?**
     - Prisma executes the SQL commands defined in the migration and updates the database.
4. **Update the Prisma Client:**
   ```sh
   yarn prisma:generate
   ```
   - **Why is this necessary?**
     - The Prisma client is updated to reflect the schema changes made to the database.