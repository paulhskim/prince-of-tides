import { BRAND_COLORS as C } from "./og-assets";

/**
 * The icon: a serif "P" in ink on paper, with a short marsh line beneath it (the tide line).
 * Proportions scale from the canvas size so 32px and 512px read the same.
 */
export function Monogram({ size }: { size: number }) {
  const small = size <= 48;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: C.paper,
        color: C.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Newsreader",
          fontWeight: 500,
          fontSize: size * (small ? 1.02 : 0.74),
          lineHeight: 0.74,
        }}
      >
        P
      </div>
      <div
        style={{
          display: "flex",
          width: size * (small ? 0.5 : 0.36),
          height: Math.max(2, Math.round(size * (small ? 0.07 : 0.022))),
          marginTop: size * (small ? -0.04 : -0.02),
          background: C.marsh,
        }}
      />
    </div>
  );
}
