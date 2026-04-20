import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, rgba(246,241,233,1) 0%, rgba(235,224,211,1) 100%)",
          position: "relative"
        }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: 70,
            background: "#50685b",
            transform: "rotate(45deg)",
            position: "absolute"
          }}
        />
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 999,
            background: "#50685b",
            position: "absolute",
            top: 110,
            left: 125
          }}
        />
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 999,
            background: "#50685b",
            position: "absolute",
            top: 110,
            right: 125
          }}
        />
      </div>
    ),
    size
  );
}
