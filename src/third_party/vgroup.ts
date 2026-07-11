import { md5 } from "js-md5";

const VGROUP_HASH_SIZE = 10 * 1024 * 1024;

export async function generateVgroup(file: File) {
  const hashSource = await file.slice(0, VGROUP_HASH_SIZE).arrayBuffer();
  return `${md5(hashSource)}_${file.size}`;
}
