import React,{useEffect} from 'react';
import './App.css';
const App = ()=>{
    useEffect(()=>{
        console.log($(".wrap"))
        $(function() {
            $( "#resizable" ).resizable();
         });
      },[])
    return(
        <>
        <div id="resizable"> 
         <h3 className="ui-widget-header">Pull my edges to resize me!!</h3>
      </div>
            <h1>Hello</h1>
        </>
    )
}
export default App;