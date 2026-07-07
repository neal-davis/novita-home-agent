import { NextResponse } from "next/server";

const endpoint = "https://nestjs-service.vercel.app";
// const endpoint = "http://localhost:3344";

export async function POST(req: Request) {
  const { uid, action } = await req.json();

  try {
    if (uid && action) {
      const form = {
        uid: Number(uid),
        action,
      };
      await fetch(`${endpoint}/reporter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
    }
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({});
  }
}
