const fs=require("fs-extra");
const path=require("path");
const filePath=path.join(__dirname,"../data/feedbacks.json");

const readData=()=>fs.readJSONSync(filePath);
const writeData=(data)=>fs.writeJSONSync(filePath,data,{spaces:2});

exports.getAll=(req,res)=>{
  const list=readData();
  res.json(list);
};

exports.create=(req,res)=>{
  const list=readData();
  const newF={
    id:list.length+1,
    name:req.body.name,
    email:req.body.email,
    message:req.body.message,
    rating:req.body.rating,
    createdAt:req.body.createdAt || new Date().toISOString()
  };
  list.push(newF);
  writeData(list);
  res.status(201).json(newF);
};