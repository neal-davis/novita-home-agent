import * as fs from "fs";
import encode from "png-chunks-encode";
import extract from "png-chunks-extract";
import PNGtext from "png-chunk-text";

/**
 * Writes Character metadata to a PNG image buffer.
 * @param {Buffer} image PNG image buffer
 * @param {string} data Character data to write
 * @returns {Buffer} PNG image buffer with metadata
 */
const write = (image: Buffer, data: string): Buffer => {
  const chunks = extract(image);
  const tEXtChunks = chunks.filter((chunk) => chunk.name === "tEXt");

  // Remove all existing tEXt chunks
  for (const tEXtChunk of tEXtChunks) {
    chunks.splice(chunks.indexOf(tEXtChunk), 1);
  }
  // Add new chunks before the IEND chunk
  const base64EncodedData = Buffer.from(data, "utf8").toString("base64");
  chunks.splice(-1, 0, PNGtext.encode("chara", base64EncodedData));
  const newBuffer = Buffer.from(encode(chunks));
  return newBuffer;
};

/**
 * Reads Character metadata from a PNG image buffer.
 * @param {Buffer} image PNG image buffer
 * @returns {string} Character data
 */
const read = (image: Buffer): string => {
  const chunks = extract(image);

  const textChunks = chunks
    .filter((chunk) => {
      return chunk.name === "tEXt";
    })
    .map((chunk) => {
      return PNGtext.decode(chunk.data);
    });

  if (textChunks.length === 0) {
    console.error("PNG metadata does not contain any text chunks.");
    throw new Error("No PNG metadata.");
  }

  const index = textChunks.findIndex(
    (chunk) => chunk.keyword.toLowerCase() == "chara",
  );

  if (index === -1) {
    console.error("PNG metadata does not contain any character data.");
    throw new Error("No PNG metadata.");
  }

  return Buffer.from(textChunks[index].text, "base64").toString("utf8");
};

/**
 * Parses a card image and returns the character metadata.
 * @param {string} cardUrl Path to the card image
 * @param {string} format File format
 * @returns {string} Character data
 */
const parse = (cardUrl: string, format?: string): string => {
  const fileFormat = format === undefined ? "png" : format;

  switch (fileFormat) {
    case "png": {
      const buffer = fs.readFileSync(cardUrl);
      return read(buffer);
    }
  }

  throw new Error("Unsupported format");
};

export { parse, write, read };
