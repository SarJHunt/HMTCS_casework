import { validateTaskInput } from "../utils/validateTask";

describe("validateTaskInput", () => {
  it("returns an error for an invalid status", () => {
    const errors = validateTaskInput({
      title: "Test task",
      status: "InvalidStatus",
      dueDate: "2025-12-31"
    });

    expect(errors).toContain("Status must be one of: Open, In Progress, Completed");
  });

  it("returns an error when title is missing", () => {
    const errors = validateTaskInput({
      status: "Open",
      dueDate: "2025-12-31"
    });
    expect(errors).toContain("Title is required and must be a non-empty string.");
  });

  it("returns an error for an invalid date string", () => {
    const errors = validateTaskInput({
      title: "Test",
      status: "Open",
      dueDate: "not-a-date"
    });
    expect(errors).toContain("Due date must be a valid date.");
  });

  it("returns an error for a past due date", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const errors = validateTaskInput({
      title: "Test task",
      status: "Open",
      dueDate: yesterday.toISOString().split("T")[0]
    });

    expect(errors).toContain("Due date must be today or later.");
  });
});
