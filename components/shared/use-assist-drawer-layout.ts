"use client";

import { useEffect } from "react";

const LAYOUT_ATTRIBUTE = "data-ai-assist-layout";

// Ref-counted so a page hiding and another showing in the same commit can't
// clear the flag the incoming page just set.
let activeDrawers = 0;

/**
 * Flags <body> while an assistant drawer is live so globals.css can left-align
 * the dashboard container and leave room for the drawer.
 *
 * This is deliberately an effect, not a `body:has([data-ai-assist-panel])`
 * selector: with `cacheComponents`, Next keeps pages you navigated away from
 * mounted inside a hidden <Activity>, so the drawer's portal node stays in the
 * DOM. Hidden Activities do run effect cleanups, so the flag goes with the page.
 */
export function useAssistDrawerLayout(): void {
  useEffect(() => {
    activeDrawers++;
    document.body.setAttribute(LAYOUT_ATTRIBUTE, "");
    return () => {
      activeDrawers--;
      if (activeDrawers === 0) {
        document.body.removeAttribute(LAYOUT_ATTRIBUTE);
      }
    };
  }, []);
}
