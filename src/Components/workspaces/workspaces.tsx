import React,{useState} from 'react';
import { List, Card, Button,Modal,Form, Input } from 'antd';

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
    const [visible,setVisible] = useState(false);
    const [loading,setLoading] = useState(false);
    const [form] = Form.useForm();
    const getTimeCal = (date:string)=>{
        const date1 = new Date(date);
        const date2 = new Date();
        let totalDays = Math.floor((date2.getTime()-date1.getTime())/(1000*3600*24))
        return totalDays;
    }

    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = (e:any) => {
        setVisible(false);
        form.resetFields();
    };

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

    const deleteWorkspace = (workid:string)=>{
        setWorkspaceData((prevData:any)=>{
            return(prevData.filter((data:any)=>{
                return data.id!=workid
            }))
        })
    }
    return (
        <div className="block workspaceBlock">
          <div className="container-fluid">
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
                </Modal>
            </div>
            <List
              grid={{
                gutter: 16,
                xs: 2,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 4,
                xxl: 4,
              }}
              dataSource={workspaceData}
              renderItem={(item:any) => (
                <List.Item>
                  <Card>
                      <div className="workspaceDetail">
                        <a href="#">{item.name}</a>
                        <Button type="primary" className="edit">Edit</Button>
                        <p>{`${getTimeCal(item.createdOn)} days ago`}</p>
                        <p>{item.isPrivate ? 'Private':'Public'}</p>
                        <Button type="primary"onClick={()=>{deleteWorkspace(item.id)}} danger>Delete</Button>
                      </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </div>  
      );
}

export default Workspaces;