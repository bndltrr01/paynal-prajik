import { FC } from "react";

interface LoaderProps {
  size?: string;
  color?: string;
  text?: string;
  className?: string;
}

const EventLoader: FC<LoaderProps> = ({ size = "80px", color = "currentColor", text, className = "" }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="lds-ellipsis inline-block relative"
        style={{ width: size, height: size }}
      >
        <div
          className="absolute top-[33.33px]"
          style={{
            left: "8px",
            width: "13.33px",
            height: "13.33px",
            borderRadius: "50%",
            background: color,
            animation: "lds-ellipsis1 0.6s infinite cubic-bezier(0, 1, 1, 0)",
          }}
        ></div>
        <div
          className="absolute top-[33.33px]"
          style={{
            left: "8px",
            width: "13.33px",
            height: "13.33px",
            borderRadius: "50%",
            background: color,
            animation: "lds-ellipsis2 0.6s infinite cubic-bezier(0, 1, 1, 0)",
          }}
        ></div>
        <div
          className="absolute top-[33.33px]"
          style={{
            left: "32px",
            width: "13.33px",
            height: "13.33px",
            borderRadius: "50%",
            background: color,
            animation: "lds-ellipsis2 0.6s infinite cubic-bezier(0, 1, 1, 0)",
          }}
        ></div>
        <div
          className="absolute top-[33.33px]"
          style={{
            left: "56px",
            width: "13.33px",
            height: "13.33px",
            borderRadius: "50%",
            background: color,
            animation: "lds-ellipsis3 0.6s infinite cubic-bezier(0, 1, 1, 0)",
          }}
        ></div>
        <style>{`
          @keyframes lds-ellipsis1 {
            0% { transform: scale(0); }
            100% { transform: scale(1); }
          }
          @keyframes lds-ellipsis3 {
            0% { transform: scale(1); }
            100% { transform: scale(0); }
          }
          @keyframes lds-ellipsis2 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(24px, 0); }
          }
        `}</style>
      </div>
      {text && <p className="mt-2 text-sm text-gray-700">{text}</p>}
    </div>
  );
};

export default EventLoader;
