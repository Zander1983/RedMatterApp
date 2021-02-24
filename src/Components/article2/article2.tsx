import React,{FC} from 'react';
import {Row,Col,Image} from 'antd';
import ff from "./../../assets/images/ff_sm.png";
import './css/style.css';


const Article2:FC = ()=>{
    return(
        <div className="block article-block">
            <div className="container-fluid">
                <div className="contentHolder">
                    <Row>
                        <Col span={12} >
                        <div className="fluorofinder">
                            <p>Red Matter has partnered with <a href="https://fluorofinder.com/" target="_blank">FluoroFinder</a>. <a href="https://fluorofinder.com/" target="_blank">FluoroFinder</a> is a multicolor fluorescent experiment design software that is free for academic and non-profit labs. Using preloaded cytometer configurations from hundreds of core facilities, FluoroFinder dynamically searches antibodies/fluorophores from multiple vendors to find reagents suitable for your specific machine.</p>
                            <a href="https://fluorofinder.com/" target="_blank">
                                    <img alt="FluoroFinder" src={ff}/>
                            </a>
                        </div>
                        </Col>
                        <Col span={12}>
                            <div style={{height:'400px'}}>
                                <iframe style={{overflow:'hidden',height:'100%',width:'100%'}} width="100%" height="100%" frameBorder="0" src="https://www.youtube.com/embed/n14eXTZGLHY" ></iframe>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}

export default Article2;