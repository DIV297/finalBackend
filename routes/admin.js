const express = require('express');
const Admin = require("../models/Admin")
const VCSchema = require("../models/VaccinationCenter");
const router = express.Router();
const JWT_SECRET = 'DivanshSignature'
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body,validationResult} = require('express-validator');

//adding admin
router.post('/addadmin',[
    body('name','Enter a valid name').isLength({min:3}),
    body('password', 'Password should have atleast 3 characters').isLength({ min: 3 }),
    body('email','Enter valid email').isEmail()
],async (req,res)=>{
    let answer = 0;
    let success = false;
    console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        answer=1;
        return res.status(400).json({answer,success,errors:errors.array()});
    }
    try{
    let user = await Admin.findOne({email:req.body.email});
    if(user){
        answer = 2;
        return res.status(400).json({answer,success,error:"sorry user with this email exits"})
    }
    console.log(req.body);
    const salt = bcrypt.genSaltSync(10);
    const securedPassword = bcrypt.hashSync(req.body.password, salt);
    console.log(req.body);
    user = await Admin.create({
        name:req.body.name,
        email:req.body.email,
        password:securedPassword}
    )
    const data ={
        user:{
            id:user.id
        }
    }
    var token = jwt.sign(data, JWT_SECRET);
    success = true;
    res.send({answer,success,token});
    }
    catch(err){
        return res.status(500).json({success,answer,error:err})
    }
})

router.post("/loginadmin", [
    body('password', 'Password should have atleast 3 characters').isLength({ min: 3 }),
    body('email', 'Enter valid email').isEmail()
], async (request, response) => {
    let success = false;
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ success,error: errors.array() })
    }
    const { email, password } = request.body;
    try {
        let user = await Admin.findOne({ email });
        if (!user) {
            return response.status(400).json({success, error: "Please login with correct crudentials" })
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return response.status(400).json({success,error: "Please login with correct crudentials" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        var token = jwt.sign(data, JWT_SECRET);
        success = true;
        response.send({success, token });
    } catch (error) {
        response.status(500).send(error);
    }
});
//adding vaccination center
router.post('/addcenter',[
    body('name','Name should be atleast 5 characters').isLength({min:5}),
    body('place',"place should have atleast 1 character").isLength({min:1}),
    body('dosage',"Not valid").isNumeric()
],async (request,response)=>{
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ error: errors.array() })
    }
    try{
        let center = await VCSchema.findOne({place:request.body.place,name:request.body.name});
        if(center){
            return response.status(400).json({error:"Center Already exits"});
        }
        await VCSchema.create(
            {
                name:request.body.name,
                place:request.body.place,
                dosage:request.body.dosage
            }
        )
    }
    catch(error){
        response.status(500).json(error);
    }
    response.json({msg:"Center added"})
})

//removing centers
router.delete("/deletecenter/:id",async (request,response)=>{
    try{
        let center =await VCSchema.findById(request.params.id);
        if(!center){
            return response.status(400).json({message:"no such center exists"});
        }
        console.log(center.id);
        let did = center.id;
        await VCSchema.findByIdAndDelete(request.params.id);
    }
    catch(error){
        response.status(500).json(error);
    }
    response.json({msg:"Center deleted"});
})

module.exports = router;