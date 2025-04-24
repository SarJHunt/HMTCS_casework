import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { validateTaskInput } from "../../../utils/validateTask";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export default async function idHandler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT id, title, description, status, TO_CHAR(due_date, 'YYYY-MM-DD') as due_date FROM tasks WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching task by ID: ", error);
      return res.status(500).json({ error: "Failed to fetch task" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task by ID: ", error);
      return res.status(500).json({ error: "Failed to delete task" });
    }
  }

  if (req.method === "PATCH") {
    const errors: string[] = validateTaskInput(req.body, true);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const { status, dueDate, description } = req.body;

      console.log("Received updates:", { status, dueDate, description });

      if (!status && !dueDate && !description) {
        return res.status(400).json({
          error: "At least one field (status, dueDate, description) is required"
        });
      }

      const updates = [];
      const values = [];
      let query = "UPDATE tasks SET ";

      if (status) {
        updates.push(`status = $${values.length + 1}`);
        values.push(status);
      }

      if (dueDate) {
        const localDate = new Date(dueDate);
        const utcDateString = localDate.toISOString();
        updates.push(`due_date = $${values.length + 1}`);
        values.push(utcDateString);
      }

      if (description) {
        updates.push(`description = $${values.length + 1}`);
        values.push(description);
      }

      query += updates.join(", ") + ` WHERE id = $${values.length + 1} RETURNING *`;
      values.push(id);

      console.log("Executing query:", query);
      console.log("With values:", values);

      const result = await pool.query(query, values);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Task not found or no changes made" });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error updating task:", error);
      return res.status(500).json({ error: "Failed to update task" });
    }
  }

  res.setHeader("Allow", ["GET", "DELETE", "PATCH"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
