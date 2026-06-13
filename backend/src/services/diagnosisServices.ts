import diagnoses from "../data/diagnoses.ts";
import type { Diagnosis } from "../types.ts";

const getEntries =(): Diagnosis[] => {
    return diagnoses;
}
export default {
    getEntries
}