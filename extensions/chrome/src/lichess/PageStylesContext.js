import React from "react";

const PageStylesContext = React.createContext({});

export const PageStylesProvider = PageStylesContext.Provider;
export const PageStylesConsumer = PageStylesContext.Consumer;

export default PageStylesContext;
