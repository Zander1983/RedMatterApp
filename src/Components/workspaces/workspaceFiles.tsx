import React,{useRef, useState} from 'react';
import { List, Card, Button,Modal,Form, Input ,Tooltip, Upload, Space,message, Row, Col} from 'antd';
import {
    EditTwoTone,
    EditFilled,
    CheckOutlined,
    CloseOutlined,
    DeleteFilled,
    UploadOutlined
} from '@ant-design/icons';
import {NavLink,useLocation} from 'react-router-dom';

const fullData = [
    {
	"_id" : "603be24975bccb0c5987b3e9",
	"label" : "16F790 ERICA NI DREAGHNAIN BM_Tube_001_001.fcs",
	"userId" : "6022e58aa53f4f9a63367f6e",
	"workspaceId" : "603be1a075bccb0c5987b3e7",
	"organisationId" : "6022e58aa53f4f9a63367f6f",
	"filename" : "files0-1614537289408.fcs",
	"paramsAnaylsis" : [
		{
			"max" : 262143,
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
			"max" : 262143,
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
			"max" : 20796.30078125,
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
			"max" : 17506.439453125,
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
			"max" : 93748.6328125,
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
			"max" : 3623.199951171875,
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
	"isPrivate" : true,
	"createdOn" : "2021-02-28T18:34:49.427Z",
	"__v" : 1
},
{
	"_id" : "603be24e75bccb0c5987b3ea",
	"label" : "16F790 ERICA NI DREAGHNAIN BM_Tube_001_001.fcs",
	"userId" : "6022e58aa53f4f9a63367f6e",
	"workspaceId" : "603be1a075bccb0c5987b3e7",
	"organisationId" : "6022e58aa53f4f9a63367f6f",
	"filename" : "files0-1614537294262.fcs",
	"paramsAnaylsis" : [
		{
			"max" : 262143,
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
			"max" : 262143,
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
			"max" : 20796.30078125,
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
			"max" : 17506.439453125,
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
			"max" : 93748.6328125,
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
			"max" : 3623.199951171875,
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
	"isPrivate" : true,
	"createdOn" : "2021-02-28T18:34:54.270Z",
	"__v" : 1
}
]

const WorkspaceAppFiles = ({match}:any)=>{
    const location:any = useLocation<any>();
    const workspaceName = location.state.workspaceName;
    const workspacesId = match.params.workspacesId;
    const fileData:any[] = [];
    fullData.map((data)=>{
        if(data.workspaceId == workspacesId){
            fileData.push(data);
        }
    })
    const [workspaceFileData,setWorkspaceFileData] = useState(fileData);
    const [loading,setLoading] = useState(false);
    const [visible,setVisible] = useState(false);
    const [form] = Form.useForm();
    const getTimeCal = (date:string)=>{
        const date1 = new Date(date);
        const date2 = new Date();
        let totalDays = Math.floor((date2.getTime()-date1.getTime())/(1000*3600*24))
        return totalDays;
    }

    const WorkspaceFileUploadForm = ()=>{
        const props = {
            name: 'file',
            action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            headers: {
                authorization: 'authorization-text',
            },
            beforeUpload(file:any) {
                console.log(file);
                console.log('upload>>>',Upload);
                // if (file.type !== 'image/png') {
                //     message.error(`${file.name} is not a png file`);
                // }
                // return file.type === 'image/png' ? true : Upload.LIST_IGNORE;
                return true
            },
            onChange(info:any) {
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                console.log('File status>>>',info.file.status)
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };

        return(
            <div className="uploadFileModal">
                <p>Upload no more than 3 files (.fcs, .lmd only) at a time (hold Control on keyboard to select multiple files). Maximum of 40MB in one upload. 
                    <br/><strong>All files in the same workspace must have the same parameters.</strong>
                </p>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Upload
                    {...props}
                    listType="picture"
                    maxCount={3}
                    multiple
                    >
                        <Button icon={<UploadOutlined />}>Upload (Max: 3)</Button>
                    </Upload>
                </Space>
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
                                <input type="text" onChange={handleChange} defaultValue={item.label} ref={editName}/>
                                <div className="action">
                                    <Tooltip placement="bottom" arrowPointAtCenter={true} title="Save Changes">
                                        <a type="button" className={!isValid ? 'saveBtn disabled' : "saveBtn"} onClick={()=>updateWorkspaceFiles(item._id,item)}><CheckOutlined /></a>
                                    </Tooltip>
                                    <Tooltip placement="bottom" arrowPointAtCenter={true} title="Cancel">
                                        <a type="button" className="cancelBtn" onClick={()=>cancel()}><CloseOutlined /></a>
                                    </Tooltip>
                                </div>
                            </div>
                        ):(
                            <div className="workspace-name">
                                <NavLink to=""><p>{item.label}</p></NavLink>
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
                <WorkspaceFileList/>
          </div>
        </div>  
    );
}

export default WorkspaceAppFiles;