import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppArticle from "../article1/article1";
import Article2 from "../article2/article2";
import AppWorking from "../work/work";

const AppHome: FC = ({ location }: any) => {
  useEffect(() => {
    let div_id = "home";
    const param = location.hash;
    let paramList = param.split("#");
    if (paramList.length > 1) {
      div_id = paramList[1];
    }
    window.scrollTo({
      behavior: "smooth",
      top: document.getElementById(div_id)?.offsetTop,
    });
  });
  const params = useParams();
  return (
    <div id="home" className="main">
      <AppArticle />
      <AppWorking />
      <Article2 />
    </div>
  );
};
export default AppHome;
