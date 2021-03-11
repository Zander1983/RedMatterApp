import React from 'react';
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
    Input
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
            {id:1,key:1,value:"100nm - 500nm"}, {id:2,key:2,value:"500nm - 20um"}
        ]
        const cellTypeList = [
            {id:1,key:1,value:"Single cells"}, {id:2,key:2,value:"Heterogenous population"}
        ]
        const onFinish = (values: any) => {
            message.success('Successfully Sent');
            console.log('Received values of form: ', values);
        };
        const formItemLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 6 },
        };
        return(
            <div className="form-div">
            <Form
                name="questionForm"
                {...formItemLayout}
                onFinish={onFinish}
            >

                <Form.Item name="device"
                label="To optimize analysis please select your Device"
                // rules={[{ required: true, message: 'Please select your Device!' }]}
                >
                    <Select placeholder="Please select a device">
                    {deviceList.map((data:any,index:number)=>{
                        return <Option key={`device${index}`} value={data.key}>{data.value}</Option>
                    })}
                    </Select>
                </Form.Item>

                <Form.Item name="fluorophores" label="Select the fluorophores in your analysis">
                    <Checkbox.Group>
                    <Row>
                        {
                            fluorophoresList.map((data:any,index:number)=>{
                                return <Col key={`fluorophores${index}`} span={12}>
                                    <Checkbox value={data.key} style={{ lineHeight: '32px' }}>
                                        {data.value}
                                    </Checkbox>
                                </Col>
                            })
                        }
                    </Row>
                    </Checkbox.Group>
                </Form.Item>

                <Form.Item name="particles_size"
                label="How big are the particles you are measuring?"
                // rules={[{ required: true, message: 'Please select your Device!' }]}
                >
                    <Select placeholder="Please select a Particle Size">
                    {particlesSizeList.map((data:any,index:number)=>{
                        return <Option key={`cellsize${index}`} value={data.key}>{data.value}</Option>
                    })}
                    </Select>
                </Form.Item>

                <Form.Item name="cell_type"
                label="What is the cell type are you measuring?"
                // rules={[{ required: true, message: 'Please select Cell Type!' }]}
                >
                    <Select placeholder="Please select a Particle Size">
                    {cellTypeList.map((data:any,index:number)=>{
                        return <Option key={`celltype${index}`} value={data.key}>{data.value}</Option>
                    })}
                    </Select>
                </Form.Item>

                <Form.Item name="description"
                label="Enter brief experiment description"
                // rules={[{ required: true, message: 'Please enter experiment description!' }]}
                >
                    <TextArea rows={5}/>
                </Form.Item>

                <Form.Item wrapperCol={{ span: 12, offset: 12 }}>
                    <Button type="primary" htmlType="submit">
                    Submit
                    </Button>
                </Form.Item>
    
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