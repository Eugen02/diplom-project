import React, { useRef, useEffect, useCallback } from "react";

interface ClickOutsideProps {
  children: React.ReactNode;
  onClickOutside: any;
}

export const ClickOutside: React.FC<ClickOutsideProps> = ({
  children,
  onClickOutside,
}) => {
  const containerRef = useRef(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        containerRef.current &&
        // @ts-ignore
        !containerRef.current.contains(event.target as Node)
      ) {
        onClickOutside();
      }
    },
    [onClickOutside]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return <div ref={containerRef}>{children}</div>;
};
