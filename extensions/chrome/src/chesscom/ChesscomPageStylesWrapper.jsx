import PageStylesContext from "@/shared/PageStylesContext.js";

export default function ChesscomPageStylesWrapper({ children }) {
  const style = getComputedStyle(document.body);
  const fontColour = style.getPropertyValue("--nodeColor");
  const successColour = style.getPropertyValue("--color-bg-win");
  const errorColour = style.getPropertyValue("--color-classification-miss");

  return (
    <PageStylesContext.Provider value={{ fontColour, successColour, errorColour }}>
      {children}
    </PageStylesContext.Provider>
  );
}
