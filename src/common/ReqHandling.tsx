import axios from 'axios';
export const updateGraph = async(url:string,reqdata:any)=>{
    try{
        console.log('2323232323>>',reqdata)
        const res =await axios.patch(url,reqdata);
        console.log("Successfully Updated")
    }catch(err){
        console.log("Failed To Updated")
    }
}

export const fetchGraphData = async()=>{
    try{
        const res = await axios.get("http://localhost:5000/graphs");
        return res.data;
    }catch(err){
        console.log(err);
        return []
    }
}

export const fetchEventsData = async()=>{
    try{
        const res = await axios.get("http://localhost:5000/events");
        return res.data;
    }catch(err){
        console.log(err);
        return []
    }
}

export const fetchParamsData = async()=>{
    try{
        const res = await axios.get("http://localhost:5000/params");
        return res.data;
    }catch(err){
        console.log(err);
        return []
    }
}

export const addGraph = async(id:string)=>{
    try{
        const url = `http://localhost:5000/graphs/${id}`;
        const res = await axios.post(url);
        return res.data;
    }catch(err){
        console.log(err);
        return []
    }
}