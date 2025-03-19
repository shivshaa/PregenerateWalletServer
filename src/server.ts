import fetch from "node-fetch"; // Works with v2.x in CommonJS
import express, { Express, Request, Response } from "express";
import cors from "cors";

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3002;

const allowedOrigins: string[] = [
  process.env.CLIENT_URL || "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

interface SubscribeRequestBody {
  email?: string;
}

interface ErrorResponse {
  error: string;
}

app.post("/subscribe", async (req: Request<{}, {}, SubscribeRequestBody>, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" } as ErrorResponse);
  }

  const url: string = "https://in-app-wallet.thirdweb.com/api/v1/pregenerate";

  const headers: Record<string, string> = {
    "x-secret-key": process.env.THIRDWEB_SECRET_KEY || "",
    "Content-Type": "application/json",
  };

  const body: string = JSON.stringify({
    strategy: "email",
    email: email,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: unknown = await response.json();
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Subscription failed" } as ErrorResponse);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});