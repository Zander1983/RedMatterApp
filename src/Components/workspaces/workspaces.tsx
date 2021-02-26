import React,{useRef, useState} from 'react';
import { List, Card, Button,Modal,Form, Input ,Tooltip} from 'antd';
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
        "id":"602b74e9e01b4c34d295c6b3",
        "name":"testing",
        "createdOn":"2021-02-16T07:31:53.576Z",
        "owner":"abhitube434@gmail.com",
        "isOwner":true,
        "isPrivate":false,
        "noAccepted":true
    },
    {
        "id":"6036460d0e12bc27db6df426",
        "name":"try1",
        "createdOn":"2021-02-24T12:26:53.814Z",
        "owner":"abhitube434@gmail.com",
        "isOwner":true,
        "isPrivate":false,
        "noAccepted":true
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
                    return data.id!=workid
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
                                <a href="#">{item.name}</a>
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
                            <a type="button" className="deleteBtn" onClick={()=>{deleteWorkspace(item.id)}}><DeleteFilled /></a>
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
                <h3>My Workspaces</h3>
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