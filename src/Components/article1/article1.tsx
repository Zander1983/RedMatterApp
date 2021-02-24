import React,{FC} from 'react';
import { Row , Col , Image } from 'antd';
import mobile_tab from '../../assets/images/mobile_tab.png';
import Login from '../login/login';
import './css/style.css';

const AppArticle:FC = ()=>{
    return(
        <div className="block block-article">
            <div className="container-fluid">
                <div className="titleHolder">
                    <h2>Free flow cytometry software 'lite'</h2>
                </div>
                <div className="contentHolder">
                    <Row>
                        <Col span={12} style={{display:'flex'}} >
                            <div className="image">
                                <Image
                                width={400}
                                src={mobile_tab}
                                preview={false}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <Login/>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}

export default AppArticle;