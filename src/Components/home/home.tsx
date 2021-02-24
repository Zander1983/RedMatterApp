import React,{FC} from 'react';
import AppArticle from '../article1/article1';
import Article2 from '../article2/article2';
import AppWorking from '../work/work';

const AppHome:FC = ()=>{
    return(
        <div id="home" className="main">
            <AppArticle/>
            <AppWorking/>
            <Article2/>
        </div>
    )
}
export default AppHome;