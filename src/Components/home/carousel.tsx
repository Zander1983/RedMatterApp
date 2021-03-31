import React from "react";
import { Carousel } from "antd";
import slide1 from "./../../assets/landing_page_imgs/img1.svg";
import slide2 from "./../../assets/landing_page_imgs/upload.png";
import slide3 from "./../../assets/landing_page_imgs/dotplot.png";
import slide4 from "./../../assets/landing_page_imgs/gate_result.png";

const ImgCarousel = () => {
  const slideDetails = [
    { id: 1, imgSrc: slide1, description: "Analyse FCS Files in 3 Steps" },
    { id: 2, imgSrc: slide2, description: "Step 1: Upload FCS file." },
    { id: 3, imgSrc: slide3, description: "Step 2: Create Graph." },
    { id: 4, imgSrc: slide4, description: "Step 3: Create Gate." },
  ];
  return (
    <Carousel autoplay>
      {slideDetails.map((data: any, index: number) => {
        return (
          <div key={`slide${index}`}>
            <div className="rightPanel">
              <p className="textCenter">{data.description}</p>
              <img id={`slide${data.id}`} src={data.imgSrc} />
            </div>
          </div>
        );
      })}
    </Carousel>
  );
};
export default ImgCarousel;
