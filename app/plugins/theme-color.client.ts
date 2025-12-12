export default defineNuxtPlugin(() => {
  const colorMode = useColorMode();
  
  const updateThemeColor = () => {
    const color = colorMode.value === "dark" ? "#1b1718" : "white";
    
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  };
  
  // Update on initial load
  updateThemeColor();
  
  // update on color mode change
  watch(() => colorMode.value, updateThemeColor);
});