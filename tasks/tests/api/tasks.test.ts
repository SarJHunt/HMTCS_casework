/**
 * @jest-environment node
 */
import handler from "../../pages/api/tasks"; 
import { createMocks } from "node-mocks-http";

// 🧪 Mock the pg Pool so no real DB is touched
jest.mock("pg", () => {
  const mClient = {
    query: jest.fn().mockResolvedValue({
      rows: [{ id: 1, title: "Mock Task", description: "From test", status: "Open", due_date: "2025-12-31" }]
    }),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mClient) };
});

describe("POST /api/tasks", () => {
  it("returns 201 for valid input", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        title: "Test Task",
        description: "Testing backend",
        status: "Open",
        dueDate: "2025-12-31",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe("Mock Task"); // Returned from mocked pg query
    expect(data.status).toBe("Open");
  });

  it("returns 400 if title is missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        description: "No title",
        status: "Open",
        dueDate: "2025-12-31",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.errors).toBeDefined();
  });
});
