import { PageStylesContext } from "@/shared";

export default function PageStylesWrapper({ children }) {
  const style = getComputedStyle(document.body);
  const fontColour = style.getPropertyValue("--color");
  const successColour = style.getPropertyValue("--success");
  const errorColour = style.getPropertyValue("--error");

  return (
    <PageStylesContext.Provider value={{ fontColour, successColour, errorColour }}>
      {children}
    </PageStylesContext.Provider>
  );
}
