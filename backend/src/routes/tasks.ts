import { Hono } from "hono";

const app = new Hono()
  .get("/", (c) => c.text("List task items"))
  .post("/", (c) => c.text("Create and return new task item", 201))
  .get("/:id", (c) => c.text("Query task item by id"))
  .put("/:id", (c) => c.text("Update task item by id"))
  .delete("/:id", (c) => c.text("Delete task item by id"));

export default app;
