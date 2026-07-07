// @ts-nocheck

import path from "path";
import fs from "fs";

import { NextResponse } from "next/server";
import { parse } from "./character-card-parser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file: File | null = await form.get("file");

  if (!file) {
    return NextResponse.error(new Error("No file uploaded"));
  }

  // json file
  if (file.type == "application/json") {
    const json = JSON.parse(await file.text());

    let characterData = json;

    if (characterData && characterData.data) {
      characterData = characterData.data;
    }

    return NextResponse.json({
      message: "Parsed successfully!",
      data: characterData,
    });
  } else if (file.type == "image/png") {
    const buffer = Buffer.from(await file.arrayBuffer());

    const tempFilePath = path.join("/tmp", file.name);
    fs.writeFileSync(tempFilePath, buffer);

    try {
      const imgData = await parse(tempFilePath, "png");
      const imgDataJson = JSON.parse(imgData);

      let characterData = imgDataJson?.data;

      if (characterData && characterData.data) {
        characterData = characterData.data;
      }

      return NextResponse.json({
        message: "Parsed successfully!",
        data: characterData,
      });
    } catch (error) {
      console.error("Error parsing image:", error);
      return NextResponse.json(
        {
          message: "Failed to parse image",
          error: error.message,
        },
        { status: 500 },
      );
    } finally {
      fs.unlinkSync(tempFilePath);
    }
  } else {
    return NextResponse.error(new Error("Invalid file type"));
  }
}
