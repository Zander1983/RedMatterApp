import React,{useState,useEffect} from 'react'
import { useParams } from 'react-router-dom';
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { Breadcrumbs, Typography, Link } from '@material-ui/core'

export default function (props:any) {
  let location = useLocation()
  const [isWorkspaceActive,setWorkspaceActive] = useState(false);
  const pathnames = location.pathname.split('/').filter((x) => x);
  useEffect(()=>{
      if(pathnames.includes('workspace')){
          setWorkspaceActive(true);
      }
  })
  return (
    <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
            <li key='main' className="breadcrumb-item text-primary my-auto">
                <a color='inherit' href="/">
                    My Workspace
                </a>
            </li>
            {
                pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`
                    
                    return last ? (
                        <li key={'wrkspc'+index} className="breadcrumb-item active my-auto" aria-current="page">{value}</li>
                    ):null
                })
            }   
            {
                isWorkspaceActive?(
                    <li key={'addBtn'} className="ml-auto">
                        <button className="btn btn-info text-light" onClick={()=>props.onClickFun(pathnames[1])}>
                            Add
                        </button>
                    </li>
                ):null
            }         
        </ol>
    </nav>
  )
}