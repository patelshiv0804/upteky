const express=require('express');
const cors=require('cors');
const morgan=require('morgan');
const feedbackRoutes=require('./routes/feedbacks');
const errorHandler=require('./middleware/errorHandler');

const app=express();
const PORT=4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/feedbacks", feedbackRoutes);

app.get("/",(req,res)=>res.send("File-based Feedback API running"));

app.use(errorHandler);

app.listen(PORT,()=>console.log("Server running on port "+PORT));