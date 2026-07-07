import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";

describe("isValidDockerImageAddress", () => {
  it.each([
    ["ubuntu", ""],
    ["library/ubuntu:22.04", ""],
    ["registry.example.com:5000/team/image:tag", ""],
    [
      "registry.example.com/team/image@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "",
    ],
    [null, "The container image is not valid"],
    [undefined, "The container image is not valid"],
    ["UpperCase/image", "The container image is not valid"],
    ["bad image", "The container image is not valid"],
  ])("validates %p", (address, expected) => {
    expect(isValidDockerImageAddress(address)).toBe(expected);
  });
});
