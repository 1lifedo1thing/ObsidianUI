"use client";

import { createContext, useContext } from "react";

/** Code inside an installation card shares its existing surface. */
export const CodeCardContext = createContext(false);

export function useCodeCard() {
    return useContext(CodeCardContext);
}
