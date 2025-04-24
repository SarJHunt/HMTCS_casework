import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT id, title, description, status, TO_CHAR(due_date, 'YYYY-MM-DD') as due_date FROM tasks");
      console.log("Tasks fetched:", result.rows);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  } else if (req.method === "POST") {

    try {
      const { title, status, dueDate } = req.body;

      if (!title || !status) {
        res.status(400).json({ error: "Title and status are required" });
        return;
      }

      const result = await pool.query(
        "INSERT INTO tasks (title, status, due_date) VALUES ($1, $2, $3) RETURNING *",
        [title, status, dueDate || null]
      );

      console.log("Task created:", result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}