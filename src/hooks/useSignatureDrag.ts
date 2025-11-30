import { useState, useEffect, useCallback } from "react";

export function useSignatureDrag(containerRef: any, disabled: boolean) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const startDrag = (e: any) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setIsDragging(true);

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const moveDrag = useCallback(
    (e: MouseEvent, setPosition: (pos: any) => void) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();

      const newX = e.clientX - container.left - dragOffset.x;
      const newY = e.clientY - container.top - dragOffset.y;

      setPosition({
        x: Math.max(0, Math.min(newX, container.width - 200)),
        y: Math.max(0, Math.min(newY, container.height - 50)),
      });
    },
    [isDragging, dragOffset, containerRef]
  );

  const stopDrag = () => setIsDragging(false);

  return { startDrag, moveDrag, stopDrag, isDragging };
}
