import express from "express";
import { config } from "dotenv";
import errorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
  path: "./data/config.env",
});

export const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"))
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: [process.env.FRONTEND_URI_1, process.env.FRONTEND_URI_2],
  })
);

app.get("/", (req, res, next) => {
  res.send("Working");
});

// Importing Routers
import user from "./routes/user.js";
import product from "./routes/products.js";
import order from "./routes/order.js";
import payment from "./routes/payment.js";

app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", payment);

app.use(errorMiddleware);
