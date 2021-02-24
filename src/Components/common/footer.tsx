import React, { FC } from 'react';

const AppFooter:FC = ()=>{
    return(
        <div className="container-fluid">
            <div style={{background:"red", textAlign: 'center',display:"flex",width:'100%' }}>
                <span>Made in Ireland 2017 Redmatterapp</span>
            </div>
        </div>
    )
}

export default AppFooter;