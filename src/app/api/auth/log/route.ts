import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { email, outcome, errorDetails } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for logging" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] User: ${email} | Outcome: ${outcome} ${
      errorDetails ? `| Details: ${errorDetails}` : ""
    }\n`;

    // Try tracking in local file natively
    const logDir = path.join(process.cwd(), "logs");
    const logFile = path.join(logDir, "auth.log");

    // Ensure directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append to file
    fs.appendFileSync(logFile, logEntry, "utf8");

    // Also console log for serverless observability
    console.log(`AUTH LOG: ${logEntry.trim()}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to write log", error);
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}
