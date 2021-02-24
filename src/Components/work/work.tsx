import React,{FC} from 'react';
import {Row,Col,List,Avatar,Image} from 'antd';
import './css/work.css';
import tablet_s from '../../assets/images/tablet_s.png';

const AppWorking:FC = ()=>{
    return(
        <div className="block workBlock">
            <div className="container-fluid" id="work">
                <div className="workTitleHolder">
                    <h2>How It Works</h2>
                </div>
                <div className="workHolder">
                    <Row gutter={[8,8]}>
                        <Col span={12} xs={{ order: 2 }} sm={{ order: 2 }} md={{ order: 1 }} lg={{ order: 1 }}>
                                <p>1.Create a free account for your organisation</p>
                                <p>2.Add users to your account</p>
                                <p>3.Upload flow cytometry files</p>
                                <p>4.From you mobile, tablet or laptop, instantly start analysing your flow cytometry files</p>
                                <p>5.To draw gates on a laptop, use the mouse. On mobile, use touch</p>
                                <p>6.Share facs analysis with colleagues</p>
                        </Col>
                        <Col span={12} xs={{ order: 1 }} sm={{ order: 1 }} md={{ order: 2 }} lg={{ order: 2 }}>
                        <div className="image">
                                <Image
                                width={400}
                                src={tablet_s}
                                preview={false}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>        
    )
}
export default AppWorking;