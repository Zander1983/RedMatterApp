import React from 'react';
import {NavLink} from 'react-router-dom';
import {Row,Col,Button} from 'antd';
import {ArrowRightOutlined} from '@ant-design/icons';
import './css/landing.css';

import ImgCarousel from './carousel';

const AppLandingPage = ()=>{
    return(
        <div className="loading-page" >
            <div className="main-div">
                <div className="block" style={{border:"none"}}>
                <div className="container-fluid">
                <Row gutter={[8, 8]}>
                    <Col xs={{span:24,order:2}} sm={{span:24,order:2}} md={{span:12,order:1}} xl={{span:12,order:1}} >
                        <div className="leftPanel textWhite">
                            <h2 className="textWhite">Welcome To, <strong>REDMatterApp</strong></h2>
                            <p>We Provide <strong>Flow Cytometry Software</strong></p>
                            <p>Now analyse FSC files in only Three Steps... </p>
                            <Button type="primary">
                                <NavLink to="/questions" className="ant-btn-primary">Start Experimenting <ArrowRightOutlined /></NavLink>
                                {/* Start Experimenting <ArrowRightOutlined /> */}
                            </Button>
                        </div>
                    </Col>
                    <Col xs={{span:24,order:1}} sm={{span:24,order:1}} md={{span:12,order:2}} xl={{span:12,order:2}} >
                        <ImgCarousel/>    
                    </Col>
                </Row>
                </div>
                </div>
            </div>
        </div>
    )
}

export default AppLandingPage;