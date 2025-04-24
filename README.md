# 🗂 TaskFlow

TaskFlow is a full-stack task manager that demonstrates my ability to build and test a RESTful API with a clean, interactive frontend using React and Tailwind CSS.

At the end of this file are some useful screenshots and a link to a video of the database reflecting changes made on the app.

---

## 🛠 Tech Stack

- **Next.js 15** with **API routes**
- **React 19** (Client components)
- **PostgreSQL** with `pg`
- **TailwindCSS** for styling
- **React Testing Library** and **Jest**
- **Postman** collection for API testing

---

## 📦 Set-up instructions

1. Clone the repo
2. Create a `.env.local` file:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=your_db
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
```
NB. You will need to download PostgreSQL to your local machine and create a database, then updating the .env.local file with the relevant details. You can then use PgAdmin to run queries and check that the tasks are being updated as per requests.

3. Install dependencies and run the app

```bash
npm install
npm run dev
```

This project installs everything you need automatically:
- PostgreSQL client (`pg`)
- Tailwind CSS for styling
- Toast notifications (`react-toastify`)
- Testing libraries: `jest`, `@testing-library/react`, `ts-jest`, etc.

4. Run the tests:

```bash
npm test
```

---

## ✅ Testing

I have set up unit testing as follows:

### Frontend
- Using **Jest + React Testing Library**
- Covering rendering, task loading, and task creation
- Validating form inputs and API call behaviours

### Backend
- Unit tests with **node-mocks-http** (no DB required)
- Mocking `pg` client for full isolation
- Validating routes like `POST /api/tasks` and handles error cases

### Utils
- Dedicated tests for `validateTask.ts`
- Covering input validation, status enums, length checks, and date logic

---

## 📮 API testing with Postman

A Postman collection is included in the `postman/` folder.

It covers:
- GET all tasks
- GET by ID
- POST (create)
- PATCH (update)
- DELETE by ID

Each request includes a description and running instructions.

---

## 🔐 Validation

### Backend validation

A reusable function (`validateTaskInput`) ensures:

- `title`: required, max 100 chars  
- `description`: optional, max 500 chars  
- `status`: must be `Open`, `In progress`, or `Completed`  
- `dueDate`: valid ISO date, must be today or later  

It returns a 400 status with detailed error messages on failure.

### Frontend validation

Validation ensures:

- The title and due date are required  
- The due date must be today or later  
- The status comes from a dropdown menu (no invalid values)
- Toast notifications provide real-time feedback

---

## 📑 API endpoints

| Method | Route              | Description             |
|--------|--------------------|-------------------------|
| GET    | `/api/tasks`       | Get all tasks           |
| POST   | `/api/tasks`       | Create a new task       |
| GET    | `/api/tasks/:id`   | Get a task by ID        |
| PATCH  | `/api/tasks/:id`   | Update a task by ID     |
| DELETE | `/api/tasks/:id`   | Delete a task by ID     |

---

## 🧠 Architecture

- **Separation of concerns** between API and UI
- **Component-based UI** via React
- **RESTful API** with clearly defined routes
- **Validation shared** across frontend and backend

---

## 🔐 Security and best practices

- Environment variables are handled securely via `.env.local`
- Input is validated client-side and server-side
- Status codes and error messages follow REST conventions

---

## 🚀 Next steps

If developed further:

- Deploy on Vercel and hosted PostgreSQL
- Add authentication and authorisation
- Improve accessibility
- Add end-to-end tests with Playwright

---

## 📸 Screenshots and video

### TaskFlow app UI

![TaskFlow app screenshot](</tasks/screenshots/app_view.png>)

### Report following test run

![Test report](</tasks/screenshots/test_report.png>)

### Video showing UI and database

Here is a [short video](<https://www.loom.com/share/3d2c3034991848259ef983e18f4d32ec?sid=9f676ee4-e68b-4d40-b116-4e36e9040d0c>) that shows the database updates based on the app's UI. It demonstrates:

- A list of all tasks in the database
- Adding a task
- Updating a task's due date
- Updating a task's status
- Deleting a task