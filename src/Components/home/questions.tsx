import React,{useState} from 'react';
import {sectionList} from './quesData';
import {
    message,
    Form,
    Select,
    Button,
    Row,
    Col,
    Input
  } from 'antd';

const { Option } = Select;
const {TextArea} = Input;

const Questions = ()=>{
    // This is form component
    const Quesform = ()=>{
        const [formObj,setFormObj] = useState<any>({});
        const [sectionId,setSectionId] = useState(1);
        
        const onFinish = (values: any) => {
            nextSection();
            message.success('Successfully Sent');
            console.log('Received values of form: ', formObj,values);
        };

        /* Code for next and prev button */
        const nextSection = ()=>{
            setSectionId((curId:any) => curId+1);
        }
        const prevSection = ()=>{
            setSectionId((curId:any) => curId-1);
        }       

        /* addFormObj is used for adding each selected options into formObj */
        const addFormObj  = (val:any,key:any)=>{
            setFormObj((prevData:any)=>{
                return {...prevData,[key]:val}
            })
        }

        /* 
            Select component for applying Select whenever required
            Props : 
            data:{
                id:1,
                name:"device",
                label:"To optimize analysis please select your Device",
                dataList:machinesData,
                placeholder:"Please select a device",
                optKey:"device"
            }
            id:index
        */
        const SelectCompnent = (props:any)=>{
            return(
                <Select
                    showSearch
                    style={{ width: "100%" }}
                    optionFilterProp="children"
                    defaultValue={formObj[props.data.name] || undefined}
                    onChange = {(val:any)=>{addFormObj(val,props.data.name)}}
                    filterOption={(input:any, option:any) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    placeholder={props.data.placeholder}
                >
                    {props.data.dataList.map((data:any,index:number)=>{
                        return <Option key={`${props.data.optKey}${index}`} value={data.key}>{data.value}</Option>
                    })}
                </Select>
            )
        }

        /* function for adding buttons */
        const renderButton = ()=>{
            if(sectionId>5){
                return undefined;
            }else{
                return(
                    <Row>
                        <Col sm={24} md={24} xl={24}>
                            <div className="btns">
                                {
                                    sectionId > 1 && 
                                    <Button onClick={prevSection} className="nextBtn">
                                        Previous
                                    </Button> 
                                }
                                { 
                                    sectionId < sectionList.length+1 &&
                                    <Button onClick={nextSection} className="nextBtn">
                                        Next
                                    </Button>
                                }
                                {  
                                    sectionId === sectionList.length+1 && 
                                    <Form.Item>
                                        <Button className="submitBtn" htmlType="submit">
                                            Submit
                                        </Button> 
                                    </Form.Item>
                                }
                            </div>
                        </Col>
                    </Row>
                )
            }
        }

        /* Code for showing step list on top */
        const steplist = [];
        for(let i=0;i<=sectionList.length+1;i++){
            steplist.push(
                <div key={i} className={sectionId === i+1?"step-col step-col-active":"step-col"} style={{width:`${100/6}%`}}><small>Step{i+1}</small></div>
            )
        }

        return(
            <div className="main-form-div">
                <div className="step-row">
                    {
                        steplist
                    }
                </div>

                <div className="form-div" >
                    <Form
                        name="questionForm"
                        onFinish={onFinish}
                        
                    >
                        {
                            sectionList.map((data:any,index:number)=>{
                                return(
                                    sectionId === index+1 && 
                                    <section key={index+1} className={`section section${index+1}`}>
                                        <Row>
                                            <Col span={24}>
                                                <Form.Item name={data.name}
                                                    label={<label className="label">{data.label}</label>} 
                                                    style={{display:'block'}}
                                                >
                                                    <SelectCompnent key={index+1} data={data} id={index+1}/>                                            
                                                </Form.Item>                                
                                            </Col>
                                        </Row>
                                    </section>
                                )
                            })                     
                        }
                        {
                            sectionId === 5 &&
                            <section className="section" style={{width:"100%"}}>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item style={{display:'block'}} name="description"
                                        label={<label className="label">Enter brief experiment description</label>}
                                        // rules={[{ required: true, message: 'Please enter experiment description!' }]}
                                        >
                                            <TextArea rows={5}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </section>
                        }
                        {
                            sectionId === 6 &&
                            <section className="section final-section">
                                <Row>
                                    <Col span={24}>
                                        <h1>Successfully Submitted</h1>
                                    </Col>
                                </Row>
                            </section>
                        }
                        <section>
                            {
                                renderButton()
                            }
                        </section>
                    </Form>
                </div>
            </div>
        )
    }
    return(
        <div className="block" style={{width:"100vw",height:"100vh"}}>
            <div className="container-fluid" style={{height:"100%",width:"500px",position:"relative"}}>
                <Quesform/>
            </div>
        </div>
    )
};
export default Questions;
