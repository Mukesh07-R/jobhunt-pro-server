const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    company: {
        type:String,
        required:true
    },
    position:{
        type:String,
        required:true
    },
    status :{
        type :String ,
        enum:['applied', 'interview','offer','rejected'],
        default:'applied',
    },
    type:{
        type :String,
        enum: ['full-time', 'part-time', 'internship', 'contract'],
        default: 'full-time',
    },
    joblocation:String,
    notes :String, 
    createdAt :{
        type:Date,
        default:Date.now
    },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Job', jobSchema);
