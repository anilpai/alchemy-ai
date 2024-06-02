import { isUndefined } from "lodash-es";
import { create } from "zustand";

// This file defines the layout state of the application, including whether the sidebar is shown. It uses the Zustand state management library to create a store for the layout state. The store includes a `toggleSidebar` function to show or hide the sidebar. The `ResponsiveWidth` enum is also defined here, which sets the responsive breakpoint width based on Tailwind CSS's responsive design settings.

// reference: https://tailwindcss.com/docs/responsive-design
export enum ResponsiveWidth {
  sm = 640,
}

interface LayoutState {
  showSidebar: boolean;
  toggleSidebar: (show?: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()((set) => ({
  showSidebar: true,
  toggleSidebar: (show) => {
    if (isUndefined(show)) {
      set((state) => ({
        ...state,
        showSidebar: !state.showSidebar,
      }));
    } else {
      set((state) => ({
        ...state,
        showSidebar: show,
      }));
    }
  },
}));
