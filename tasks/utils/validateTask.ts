export const allowedStatuses = ["Open", "In Progress", "Completed"];

export function validateTaskInput(data: any, isPartial = false): string[] {
  const errors: string[] = [];

  // For full creation (e.g., POST), require title and status
  if (!isPartial) {
    if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
      errors.push("Title is required and must be a non-empty string.");
    }
    if (!data.status || !allowedStatuses.includes(data.status)) {
      errors.push("Status is required and must be one of: " + allowedStatuses.join(", "));
    }
    if (!data.dueDate) {
      errors.push("Due date is required.");
    }
  }

  if (data.title && data.title.length > 100) {
    errors.push("Title cannot exceed 100 characters.");
  }

  if (data.description && data.description.length > 500) {
    errors.push("Description cannot exceed 500 characters.");
  }

  if (data.status && !allowedStatuses.includes(data.status)) {
    errors.push("Status must be one of: " + allowedStatuses.join(", "));
  }


  if (data.dueDate) {
    const due = new Date(data.dueDate);
    const now = new Date();
    if (isNaN(due.getTime())) {
      errors.push("Due date must be a valid date.");
    } else if (due < now) {
      errors.push("Due date must be today or later.");
    }
  }

  return errors;
}