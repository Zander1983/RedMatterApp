import { useEffect, useState } from "react";

function Plot(props) {
  const [localPolygon, setlocalPolygon] = useState(props.polygon);

  useEffect(() => {
    // in here get the canvas context
    const { context } = getContext();
    // transforms data and draw the polygon on the canvas canvas
  }, [localPolygon]);

  const handleMouseMove = (event) => {
    // making some changes here to localPolgon as user drag
    // then update localPolygon
    setLocalPolygon(localPolygon);
  };

  return (
    <>
      {" "}
      <canvas
        className="canvas"
        onMouseMove={(e) => {
          let nativeEvent = e.nativeEvent;
          handleMouseMove(nativeEvent);
        }}
      />
    </>
  );
}

export default Plot;
