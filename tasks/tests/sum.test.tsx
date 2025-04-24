import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TaskList from "../components/taskList";
import { Task } from "../components/taskList";

const mockedFetch = jest.fn((): Promise<Response> =>
  Promise.resolve({
    json: (): Promise<Task[]> =>
      Promise.resolve([
        { id: 1, title: "Test Task 1", description: "Description 1", status: "Open", dueDate: "2025-04-28T00:00:00.000Z" },
        { id: 2, title: "Test Task 2", description: "Description 2", status: "Completed", dueDate: "2025-05-05T00:00:00.000Z" },
      ]),
    ok: true,
  } as Response)
);

global.fetch = mockedFetch;

describe("TaskList component", () => {
  beforeEach(() => {
    mockedFetch.mockClear();
  });

  test("renders the task list heading", async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.queryByText("Loading tasks...")).not.toBeInTheDocument();
      expect(screen.getByText("All tasks")).toBeInTheDocument();
    });
  });

  test("displays tasks fetched from the API", async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      expect(screen.getByText("Test Task 2")).toBeInTheDocument();
    });
  });

  test("displays a message when no tasks are available", async () => {
    mockedFetch.mockImplementationOnce((): Promise<Response> =>
      Promise.resolve({
        json: (): Promise<Task[]> => Promise.resolve([]),
        ok: true,
      } as Response)
    );

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.queryByText("Loading tasks...")).not.toBeInTheDocument();
      expect(screen.queryByText("All tasks")).not.toBeInTheDocument(); // Wait for this to disappear
      expect(screen.getByText("No tasks available")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("API call is made when component mounts", async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalled();
    });
  });

  test("allows user to create a new task through the form", async () => {
    mockedFetch
      .mockResolvedValueOnce({
        json: (): Promise<Task[]> =>
          Promise.resolve([
            { id: 1, title: "Test Task 1", description: "Description 1", status: "Open", dueDate: "2025-04-28T00:00:00.000Z" }
          ]),
        ok: true,
      } as Response)
      .mockResolvedValueOnce({
        json: async () => ({
          id: 3,
          title: "New Task",
          description: "New Description",
          status: "Open",
          due_date: "2025-12-31"
        }),
        ok: true,
      } as Response);
  
    render(<TaskList />);
  
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    });
  
    // Fill out and submit the form
    screen.getByPlaceholderText("Task title").focus();
    await waitFor(() =>
      screen.getByPlaceholderText("Task title").dispatchEvent(
        new Event("input", { bubbles: true })
      )
    );
    fireEvent.change(screen.getByPlaceholderText("Task title"), {
      target: { value: "New Task" }
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "New Description" }
    });
    fireEvent.change(screen.getAllByDisplayValue("Open")[0], {
      target: { value: "Open" }
    });
    fireEvent.change(screen.getByDisplayValue(""), {
      target: { value: "2025-12-31" }
    });
  
    screen.getByText("Add task").click();
  
    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith(
        "/api/tasks",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("New Task")
        })
      );
  
      expect(screen.getByText("New Task")).toBeInTheDocument();
    });
  });
  

});