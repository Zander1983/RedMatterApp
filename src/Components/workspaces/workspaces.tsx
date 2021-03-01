import React,{useRef, useState} from 'react';
import { List, Card, Button,Modal,Form, Input ,Tooltip , Row,Col} from 'antd';
import axios from 'axios';
import {NavLink} from 'react-router-dom';
import './css/style.css';
import {
    EditTwoTone,
    EditFilled,
    CheckOutlined,
    CloseOutlined,
    DeleteFilled
} from '@ant-design/icons';

const data:any =[
    {
        "_id" : "603be1a075bccb0c5987b3e7",
        "userId" : "6022e58aa53f4f9a63367f6e",
        "name" : "Test workspace 1",
        "organisationId" : "6022e58aa53f4f9a63367f6f",
        "paramsAnaylsis" : [
            {
                "min" : 0,
                "acceptedMin" : 0,
                "fifthPercentile" : 0,
                "scaledMinLin" : 0,
                "scaledMinBi" : 0,
                "scaledMaxLin" : 262143,
                "scaledMaxBi" : 262143,
                "paramName" : "FSC-A"
            },
            {
                "min" : 0,
                "acceptedMin" : 0,
                "fifthPercentile" : 0,
                "scaledMinLin" : 0,
                "scaledMinBi" : 0,
                "scaledMaxLin" : 262143,
                "scaledMaxBi" : 262143,
                "paramName" : "SSC-A"
            },
            {
                "min" : -27.719999313354492,
                "acceptedMin" : 0,
                "fifthPercentile" : -16.820999240875242,
                "scaledMinLin" : -27.719999313354492,
                "scaledMinBi" : -27.719999313354492,
                "scaledMaxLin" : 20796.30078125,
                "scaledMaxBi" : 20796.30078125,
                "paramName" : "FITC-A"
            },
            {
                "min" : -73.08000183105469,
                "acceptedMin" : 0,
                "fifthPercentile" : -36.540000915527344,
                "scaledMinLin" : -73.08000183105469,
                "scaledMinBi" : -73.08000183105469,
                "scaledMaxLin" : 17506.439453125,
                "scaledMaxBi" : 17506.439453125,
                "paramName" : "PE-A"
            },
            {
                "min" : -38.939998626708984,
                "acceptedMin" : 0,
                "fifthPercentile" : -23.599998474121094,
                "scaledMinLin" : -38.939998626708984,
                "scaledMinBi" : -38.939998626708984,
                "scaledMaxLin" : 93748.6328125,
                "scaledMaxBi" : 93748.6328125,
                "paramName" : "APC-A"
            },
            {
                "min" : 0,
                "acceptedMin" : 0,
                "fifthPercentile" : 0,
                "scaledMinLin" : 0,
                "scaledMinBi" : 0,
                "scaledMaxLin" : 3623.199951171875,
                "scaledMaxBi" : 3623.199951171875,
                "paramName" : "Time"
            }
        ],
        "isDemo" : false,
        "isPrivate" : true,
        "createdOn" : "2021-02-28T18:32:00.606Z",
        "__v" : 1,
        "gateId" : "603beb1152a37310ca068383"
    },
    {
        "_id" : "603be1a875bccb0c5987b3e8",
        "userId" : "6022e58aa53f4f9a63367f6e",
        "name" : "Test workspace 2",
        "organisationId" : "6022e58aa53f4f9a63367f6f",
        "paramsAnaylsis" : [ ],
        "isDemo" : false,
        "isPrivate" : false,
        "createdOn" : "2021-02-28T18:32:08.340Z",
        "__v" : 0
    }
]
interface WorkspaceType{
    "id":string,
    "name":string,
    "createdOn":string,
    "owner":string,
    "isOwner":boolean,
    "isPrivate":boolean,
    "noAccepted":boolean
}
const Workspaces = ()=>{
    const [workspaceData,setWorkspaceData] = useState(data);
    const [loading,setLoading] = useState(false);
    const [visible,setVisible] = useState(false);
    const [form] = Form.useForm();

    const getTimeCal = (date:string)=>{
        const date1 = new Date(date);
        const date2 = new Date();
        let totalDays = Math.floor((date2.getTime()-date1.getTime())/(1000*3600*24))
        return totalDays;
    }
    // const getWorkspaceData = ()=>{
    //     axios.get('https://samplefcsdata.s3-eu-west-1.amazonaws.com/fcsfiles.json').then((data)=>{
    //         console.log('workspacedata>>>>',data);
    //     }).catch((e)=>{
    //         console.log(e)
    //     })
    // }
    // getWorkspaceData();
    // Workspace child components
    const WorkspaceCard = ({item}:any)=>{
        const [isInEditMode,setIsInEditMode] = useState(false);
        const editName = useRef<HTMLInputElement>(null);
        const [isValid,setIsValid] = useState(true);

        const updateWorkspace = (id:string,data:any)=>{
            const newWorkspaceName = editName.current?.value || '';
            data['name'] = newWorkspaceName;
            setIsInEditMode((prevData:Boolean) => !prevData);
        }
    
        const changeEditMode = ()=>{
            setIsInEditMode((prevData:Boolean) => !prevData);
        }

        const deleteWorkspace = (workid:string)=>{
            setWorkspaceData((prevData:any)=>{
                return(prevData.filter((data:any)=>{
                    return data._id!=workid
                }))
            })
        }

        const cancel = ()=>{
            setIsInEditMode(false);
            setIsValid(true);
        }

        const handleChange = (event:any)=>{
            setIsValid(true);
            if(event.target.value.length == 0){
                setIsValid(false);
            }
        }

        return(
            <Card>
                <div className="workspaceDetail">
                    {
                        isInEditMode?(
                            <div className="editable">
                                <input type="text" onChange={handleChange} defaultValue={item.name} ref={editName}/>
                                {/* <Button type="primary" disabled={!isValid?disabled:null} className="edit" onClick={()=>updateWorkspace(item.id,item)}>Save</Button> */}
                                {/* <Button type="primary" onClick={()=>cancel()}>Cancel</Button> */}
                                <div className="action">
                                    <Tooltip placement="bottom" arrowPointAtCenter={true} title="Save Changes">
                                        <a type="button" className={!isValid ? 'saveBtn disabled' : "saveBtn"} onClick={()=>updateWorkspace(item.id,item)}><CheckOutlined /></a>
                                    </Tooltip>
                                    <Tooltip placement="bottom" arrowPointAtCenter={true} title="Cancel">
                                        <a type="button" className="cancelBtn" onClick={()=>cancel()}><CloseOutlined /></a>
                                    </Tooltip>
                                </div>
                            </div>
                        ):(
                            <div className="workspace-name">
                                <NavLink to={{pathname:`/files/${item._id}`,state:{workspaceName:item.name}}}><p>{item.name}</p></NavLink>
                                {/* <Button type="primary" className="edit" onClick={()=>changeEditMode()}><EditFilled /></Button> */}
                            </div>
                        )
                    }
                    <p>{`${getTimeCal(item.createdOn)} days ago`}</p>
                    <p>{item.isPrivate ? 'Private':'Public'}</p>
                    <div className="main-action">
                        {
                            isInEditMode?null:
                                <Tooltip placement="bottom" arrowPointAtCenter={true} title="Edit">
                                    <a type="button" className="editBtn" onClick={()=>changeEditMode()}><EditFilled /></a>
                                </Tooltip>
                        }
                        <Tooltip placement="bottom" arrowPointAtCenter={true} title="Delete">
                            <a type="button" className="deleteBtn" onClick={()=>{deleteWorkspace(item._id)}}><DeleteFilled /></a>
                        </Tooltip>
                        {/* <Button type="primary"onClick={()=>{deleteWorkspace(item.id)}} danger>Delete</Button> */}
                    </div>
                </div>
            </Card>
        )
    }

    const WorkspaceList = ()=>{
        return(
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 4,
                lg: 4,
                xl: 4,
                xxl: 4,
              }}
              dataSource={workspaceData}
              renderItem={(item:any) => (
                <List.Item>
                    <WorkspaceCard item={item}/>
                </List.Item>
              )}
            />
        )
    }

    const WorkspaceAddForm = ()=>{
        const layout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        };
    
        const tailLayout = {
            wrapperCol: { offset: 8, span: 16 },
        };

        const addWorkspace = (values: any) => {
            setLoading(true);
            let newWorkspace:any = {};
            newWorkspace['id']="6036460d0e12bc27db6df426";
            newWorkspace['name']=values.workspacename;
            newWorkspace['createdOn']=new Date().toISOString();
            newWorkspace['owner']="abhitube434@gmail.com";
            newWorkspace['isOwner']=true;
            newWorkspace['isPrivate']=false;
            newWorkspace['noAccepted']=true;
            setWorkspaceData((prevData:any)=>{
                return [...prevData,newWorkspace]
            })
            form.resetFields();
            setVisible(false);
            setLoading(false);
        };

        return(
            <Form {...layout} form={form} name="control-hooks" onFinish={addWorkspace}>
                <Form.Item name="workspacename" label="Workspace Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Add
                    </Button>
                </Form.Item>
            </Form>
        )
    }

    const WorkspaceHeader = ()=>{
        const showModal = () => {
            setVisible(true);
        };

        const handleCancel = (e:any) => {
            setVisible(false);
            form.resetFields();
        };

        return(
            <div className="workspaceHeader">
                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12} className="title">
                        <h3>My Workspaces</h3>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12} className="workspaceFileBtn">
                        <Button type="primary" onClick={showModal} className="text-dark">Create New Workspace</Button>
                        <Modal
                            visible={visible}
                            title="Add Workspace"
                            onCancel={handleCancel}
                            footer={null}
                            destroyOnClose = {true}
                        >
                            <WorkspaceAddForm/>
                        </Modal>
                    </Col>
                </Row>
            </div>
        )
    }

    return (
        <div className="block workspaceBlock">
          <div className="container-fluid">
                <WorkspaceHeader/>
                <WorkspaceList/>
          </div>
        </div>  
    );
}
export default Workspaces;