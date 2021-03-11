import React from 'react';
import {machinesData,fluorophoresData} from './quesData';
import {
    message,
    Form,
    Select,
    InputNumber,
    Switch,
    Radio,
    Slider,
    Button,
    Upload,
    Rate,
    Checkbox,
    Row,
    Col,
    Input,
    Table
  } from 'antd';
  import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
  
  const { Option } = Select;
  const {TextArea} = Input;


const Questions = ()=>{
    const Quesform = ()=>{
        const deviceList = [
            {id:1,key:1,value:"ZE5 Cell Analyzer"}, {id:2,key:2,value:"S3e Cell Sorter"}
        ]
        const fluorophoresList = [
            {id:1,key:1,value:"FL1"}, {id:2,key:2,value:"FL2"}
        ]
        const particlesSizeList = [
            {id:1,key:"Below 1µm",value:"Below 1µm"}, {id:2,key:"1-3 µm",value:"1-3 µm"}, {id:3,key:"2µm+",value:"2µm+"}
        ]
        const cellTypeList = [
            {id:1,key:1,value:"Single cells"}, {id:2,key:2,value:"Heterogenous population"}
        ]
        const onFinish = (values: any) => {
            message.success('Successfully Sent');
            console.log('Received values of form: ', values);
        };
        const columns = [
            {
                title:'Fluorophores',
                key:"fluorophores_name",
                width:100
            },
            {
                title:'Fluorophores',
                key:"fluorophores_name2",
                width:100
            },
            {
                title:'Fluorophores',
                key:"fluorophores_name3",
                width:100
            }
        ]
        return(
            <div className="form-div">
            <Form
                name="questionForm"
                onFinish={onFinish}
            >

                <Row>
                    <Col sm={24} md={12} xl={12}>
                        <Row>
                            <Col span={24}>
                                <Form.Item name="device"
                                    label="To optimize analysis please select your Device" style={{display:'block'}}
                                    // rules={[{ required: true, message: 'Please select your Device!' }]}
                                >
                                        <Select
                                            showSearch
                                            style={{ width: "80%" }}
                                            optionFilterProp="children"
                                            filterOption={(input:any, option:any) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            placeholder="Please select a device"
                                        >
                                            {machinesData.map((data:any,index:number)=>{
                                                return <Option key={`device${index}`} value={data.key}>{data.value}</Option>
                                            })}
                                        </Select>
                                </Form.Item>                                
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item name="cell_type"
                                    style={{display:'block'}}
                                    label="What is the cell type are you measuring?"
                                // rules={[{ required: true, message: 'Please select Cell Type!' }]}
                                >
                                    <Select 
                                    style={{ width: "80%" }}
                                    placeholder="Please select a Cell Type">
                                    {cellTypeList.map((data:any,index:number)=>{
                                        return <Option key={`celltype${index}`} value={data.key}>{data.value}</Option>
                                    })}
                                    </Select>
                                </Form.Item>
                            </Col>                    
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item name="particles_size"
                                    style={{display:'block'}}
                                    label="How big are the particles you are measuring?"
                                // rules={[{ required: true, message: 'Please select your Device!' }]}
                                >
                                    <Select style={{ width: "80%" }} placeholder="Please select a Particle Size">
                                    {particlesSizeList.map((data:any,index:number)=>{
                                        return <Option key={`cellsize${index}`} value={data.key}>{data.value}</Option>
                                    })}
                                    </Select>
                                </Form.Item>
                            </Col>                    
                        </Row>
                    </Col>
                    <Col sm={24} md={12} xl={12}>
                        <Row>
                            <Col span={24}>
                                <Form.Item style={{display:'block'}} name="description"
                                label="Enter brief experiment description"
                                // rules={[{ required: true, message: 'Please enter experiment description!' }]}
                                >
                                    <TextArea rows={10}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row>
                    <Col sm={24} md={12} xl={12}>
                        <Form.Item style={{display:'block'}} name="fluorophores" label="Select the fluorophores in your analysis">
                            <Select
                                showSearch
                                style={{ width: "80%" }}
                                placeholder="Select the fluorophores in your analysis"
                                optionFilterProp="children"
                                filterOption={(input:any, option:any) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {fluorophoresData.map((data:any,index:number)=>{
                                    return <Option key={`device${index}`} value={data.key}>{data.value}</Option>
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    {/* <Col sm={24} md={12} xl={12}>
                        <Table columns={columns}/>
                    </Col> */}
                </Row>

                <Row>
                    <Col sm={24} md={24} xl={24}>
                        <Form.Item wrapperCol={{ span: 12, offset: 12 }}>
                            <Button type="primary" htmlType="submit">
                            Submit
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            </div>
        )
    }
    return(
        <div className="block" style={{background:'#ddf'}}>
            <div className="container-fluid">
                <h2 className="textCenter">Please Enter Following Details :</h2>
                <Quesform/>
            </div>
        </div>
    )
}
export default Questions;