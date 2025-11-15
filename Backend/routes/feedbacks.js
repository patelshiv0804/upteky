const router=require("express").Router();
const {body,validationResult}=require("express-validator");
const controller=require("../controllers/feedbackController");

const validate=[
  body("name").notEmpty(),
  body("email").isEmail(),
  body("message").notEmpty(),
  body("rating").isInt({min:1,max:5})
];

router.get("/", controller.getAll);

router.post("/", validate, (req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
  controller.create(req,res);
});

module.exports=router;