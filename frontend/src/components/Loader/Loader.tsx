import React from "react";
import "./loader.scss";
import netDriveLogo from "../../assets/netdrive-logo.png";

interface LoaderProps {
  fullScreen?: boolean;
  loading?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  fullScreen = false,
  loading = true,
}) => {
  if (!loading) return null;

  return (
    <div className={`loader-overlay ${fullScreen ? "fullscreen" : ""}`}>
      <img src={netDriveLogo} alt="Loading..." className="loader-logo" />
    </div>
  );
};

export default Loader;