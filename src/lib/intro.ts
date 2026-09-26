import { createContext, useContext } from "react";

/** False while the intro overlay still covers the page, so the Home particle fly-in waits for it. */
export const IntroReadyContext = createContext(true);

export const useIntroReady = () => useContext(IntroReadyContext);
