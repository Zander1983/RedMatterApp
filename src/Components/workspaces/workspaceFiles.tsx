import React,{useRef, useState,useEffect} from 'react';
import { List, Card, Button,Modal,Form, Input ,Tooltip, Upload, Space,message, Row, Col} from 'antd';
// import axios from './../common/axios';
import axios from 'axios';
import {
    EditTwoTone,
    EditFilled,
    CheckOutlined,
    CloseOutlined,
    DeleteFilled,
    UploadOutlined
} from '@ant-design/icons';
import {NavLink,useLocation} from 'react-router-dom';

const WorkspaceAppFiles = ({id}:any)=>{
    const location:any = useLocation<any>();
    const workspaceName = location.state.workspaceName;
    const workspacesId = id;
    const fileData:any[] = [];
    const [workspaceFileData,setWorkspaceFileData] = useState<any[]>([]);
    const [loading,setLoading] = useState(false);
    const [visible,setVisible] = useState(false);
    const [form] = Form.useForm();

    let organisationId ="";
    let user = JSON.parse(localStorage?.getItem('user'));
    if(user){
        organisationId = user['organisationId'];
    }

    const options = {
        headers:{
            'Token' : localStorage.getItem("token")
        }
    }

    useEffect(()=>{

        const getWorkspaceFileData = async()=>{
            try{
                setLoading(true);
                const response = await axios.get(`api/files?organisationId=${organisationId}&workspaceId=${id}`,options).catch((err)=>console.log(err))
                if(response){
                    const datatemp = response.data;
                    // datatemp.map((data:any)=>{
                    //     if(data.workspaceId == workspacesId){
                    //         fileData.push(data);
                    //     }
                    // })
                    datatemp.files.map((data:any)=>{
                        fileData.push(data)
                    })
                    setWorkspaceFileData(fileData);
                    setLoading(false);
                }
            }catch(err){
                setLoading(false);
            }
        }
        getWorkspaceFileData();
    },[])
    const getTimeCal = (date:string)=>{
        const date1 = new Date(date);
        const date2 = new Date();
        let totalDays = Math.floor((date2.getTime()-date1.getTime())/(1000*3600*24))
        return totalDays;
    }

    const WorkspaceFileUploadForm = ()=>{
        const [selectedFile,setSelectedFile] = useState(null);
        // const props = {
        //     name: 'file',
        //     action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        //     headers: {
        //         authorization: 'authorization-text',
        //     },
        //     beforeUpload(file:any) {
        //         console.log(file);
        //         console.log('upload>>>',Upload);
        //         // if (file.type !== 'image/png') {
        //         //     message.error(`${file.name} is not a png file`);
        //         // }
        //         // return file.type === 'image/png' ? true : Upload.LIST_IGNORE;
        //         return true
        //     },
        //     onChange(info:any) {
        //         if (info.file.status !== 'uploading') {
        //             console.log(info.file, info.fileList);
        //         }
        //         console.log('File status>>>',info.file.status)
        //         if (info.file.status === 'done') {
        //             message.success(`${info.file.name} file uploaded successfully`);
        //         } else if (info.file.status === 'error') {
        //             message.error(`${info.file.name} file upload failed.`);
        //         }
        //     },
        // };
        useEffect(()=>{},[selectedFile])
        const getFiles = (event:any)=>{
            console.log('events>>>>>',event.target.files)
            const data = new FormData();
            for(let fileCount = 0; fileCount<event.target.files.length; fileCount++){
                data.append(`files[${fileCount}]`,event.target.files[fileCount]);
            }
            // data.append('files',event.target.files[0]);
            data.append('organisationId',organisationId);
            data.append('workspaceId',workspacesId);
            axios.post('api/upload',data,options).then((res:any)=>{
                console.log('response>>>>>>',res)
                setVisible(false)
            }).catch((err:any)=>{
                console.log('er12344=>>>>>',err)
            })
        }
        return(
            <div className="uploadFileModal">
                <p>Upload no more than 3 files (.fcs, .lmd only) at a time (hold Control on keyboard to select multiple files). Maximum of 40MB in one upload. 
                    <br/><strong>All files in the same workspace must have the same parameters.</strong>
                </p>
                {/* <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Upload
                    {...props}
                    listType="picture"
                    maxCount={3}
                    multiple
                    >
                        <Button icon={<UploadOutlined />}>Upload (Max: 3)</Button>
                    </Upload>
                </Space> */}
                <input type="file" name="files" multiple onChange={getFiles}/>
            </div>
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
                        <h3>{workspaceName} - Files</h3>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12} className="workspaceFileBtn">
                        <Button type="primary" onClick={showModal} className="text-dark">Upload Files</Button>
                        <Modal
                            visible={visible}
                            title="Upload a Flow Cytometry File"
                            onCancel={handleCancel}
                            footer={null}
                            destroyOnClose = {true}
                        >
                            <WorkspaceFileUploadForm/>
                        </Modal>
                        <Button type="primary" className="text-dark">Analyse</Button>
                    </Col>
                </Row> 
            </div>
        )
    }

    const WorkspaceFileCard = ({item}:any)=>{
        const [isInEditMode,setIsInEditMode] = useState(false);
        const editName = useRef<HTMLInputElement>(null);
        const [isValid,setIsValid] = useState(true);

        const updateWorkspaceFiles = (id:string,data:any)=>{
            const newWorkspaceName = editName.current?.value || '';
            data['label'] = newWorkspaceName;
            setIsInEditMode((prevData:Boolean) => !prevData);
        }
    
        const changeEditMode = ()=>{
            setIsInEditMode((prevData:Boolean) => !prevData);
        }

        const deleteWorkspace = (workid:string)=>{
            setWorkspaceFileData((prevData:any)=>{
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
                                <input type="text" onChange={handleChange} defaultValue={item.label} ref={editName}/>
                                <div className="action">
                                    <Tooltip placement="bottom" arrowPointAtCenter={true} title="Save Changes">
                                        <a type="button" className={!isValid ? 'saveBtn disabled' : "saveBtn"} onClick={()=>updateWorkspaceFiles(item.id,item)}><CheckOutlined /></a>
                                    </Tooltip>
                                    <Tooltip placement="bottom" arrowPointAtCenter={true} title="Cancel">
                                        <a type="button" className="cancelBtn" onClick={()=>cancel()}><CloseOutlined /></a>
                                    </Tooltip>
                                </div>
                            </div>
                        ):(
                            <div className="workspace-name">
                                <NavLink to={`/analyse/${workspacesId}/${item.id}`}><p>{item.label}</p></NavLink>
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
                    </div>
                </div>
            </Card>
        )
    }

    const WorkspaceFileList = ()=>{
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
              dataSource={workspaceFileData}
              renderItem={(item:any) => (
                <List.Item>
                    <WorkspaceFileCard item={item}/>
                </List.Item>
              )}
            />
        )
    }
    return (
        <div className="block workspaceBlock">
          <div className="container-fluid">
                <WorkspaceHeader/>

                {loading?<h1>Loading...</h1>:<WorkspaceFileList/>}
          </div>
        </div>  
    );
}

export default WorkspaceAppFiles;