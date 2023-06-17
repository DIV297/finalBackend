const express = require('express');

const User = require("../models/User")
const VCSchema = require("../models/VaccinationCenter");
const router = express.Router();
const JWT_SECRET = 'DivanshSignature'
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body,validationResult} = require('express-validator');
const fetchuser = require("../middleware/fetchuser");
const Slots = require('../models/Slots');

//signup
router.post('/adduser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('password', 'Password should have atleast 8 characters').isLength({ min: 3 }),
    body('email','Enter valid email').isEmail()
],async (req,res)=>{
    let answer = 0;
    let success  = false;
    console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        answer=1;
        return res.status(400).json({answer,success,errors:errors.array()});
    }
    try{
    let user = await User.findOne({email:req.body.email});
    if(user){
        answer = 2;
        return res.status(400).json({answer,success,error:"sorry user with this email exits"})
    }
    console.log(req.body);
    const salt = bcrypt.genSaltSync(10);
    const securedPassword = bcrypt.hashSync(req.body.password, salt);
    console.log(req.body);
    user = await User.create({
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
        return res.status(500).json({error:err})
    }
})

//login
router.post("/loginuser", [
    body('password', 'Password should have atleast 3 characters').isLength({ min: 3 }),
    body('email', 'Enter valid email').isEmail()
], async (request, response) => {
    let success = false;
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({success,error: errors.array() })
    }
    const { email, password } = request.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return response.status(400).json({success, error: "Please login with correct crudentials" })
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return response.status(400).json({success, error: "Please login with correct crudentials" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        var token = jwt.sign(data, JWT_SECRET);
        success = true;
        console.log(success);
        console.log(token);
        response.send({success, token });
    } catch (error) {
        response.status(500).send(error);
    } 
});

// fetchuser
router.post('/getuser', fetchuser, async (request, response) => {
    try {
        userId = request.user.id;
        const user = await User.findById(userId).select("-password")
        response.send(user)
    } catch (error) {
        console.error(error.message);
        response.status(401).send('Internal Server Error');
    }
})
//display all vaccination centers
router.post('/displaycenter',async (request,response)=>{
    try{
    let center = await VCSchema.find();
    response.json(center);
    }
    catch(error){
        response.status(500).json(error);
    }
})


//apply for slot
router.post('/applyforslot/:id',fetchuser,async (req,res)=>{
    try {
        console.log(req.params.id)
    let slotavailabe = await VCSchema.findById(req.params.id);
    console.log(slotavailabe);
        //   let sl = await Slots.create(
        //     {
        //         name:slotavailabe.name,
        //       place:slotavailabe.place
        //     }
            
        // )
        // res.json(sl);
        res.status(200).json({good:"ok"})
    } catch(error){
        console.error(error.message);
        res.status(500).send('Internal Server Error');
      }
    
})
module.exports = router;