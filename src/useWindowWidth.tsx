import { useEffect, useState } from "react";

function getWindow() {
  const { innerWidth } = window;
  return innerWidth;
}

function useWindowWidth() {
  const [width, setWidth] = useState(getWindow());
  useEffect(() => {
    function handleResize() {
      setWidth(getWindow());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

export default useWindowWidth;
