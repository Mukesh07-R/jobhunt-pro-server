const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const Job = require("../models/Job");

//  Add Job Route
router.post("/", auth, async (req, res) => {
  const { company, position, status, type, joblocation, notes } = req.body;

  console.log(" Logged in user:", req.user); // Debug user
  console.log(" Job request body:", req.body); // Debug input

  if (!company || !position) {
    return res.status(400).send("Company and position are required");
  }

  try {
    const job = new Job({
      company,
      position,
      status,
      type,
      joblocation,
      notes,
      userId: req.user.userId, 
    });

    await job.save();
    console.log(" Job saved:", job);
    res.status(201).json(job); 
  } catch (err) {
    console.error(" Error adding job:", err.message);
    res.status(500).send("Server Error");
  }
});

// 🔽 Get All Jobs Route
router.get("/", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/:id",auth ,async (req,res)=>{
  try{
    const job =await Job.findOneAndDelete({
      _id:req.params.id,
      userId:req.user.userId,
    });
     if (!job) return res.status(404).json({ msg: "Job not found" });
     res.json({msg:"Job deleted "})

  }catch(err){
    console.error("Error deleting job:",err);
    res.status(500).send("Server Error");
  }
})


// Update Route 
router.put("/:id",auth ,async (req,res)=>{
  const {company,position,status,joblocation,notes}=req.body;

  try{
    let job = await Job.findOne({_id :req.params.id ,userId:req.user.userId});

    if(!job) return res.status(400).send("Job not Found")

    if (company !== undefined) job.company = company;
    if (position !== undefined) job.position = position;
    if (status !== undefined) job.status = status;
    if (joblocation !== undefined) job.joblocation = joblocation;
    if (notes !== undefined) job.notes = notes;


    await job.save();

    res.json ({msg:"Job updated successfully",job});
     }catch(err){
       console.error("Update Error",err)
       res.status(500).send("Server Error");
  }
})


module.exports = router;