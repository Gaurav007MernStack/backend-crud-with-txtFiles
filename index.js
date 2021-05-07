const express = require("express");//reuired for node js initialisation
const app = express();
const bodyParser = require("body-parser");//for using middleware
const mongoose = require('mongoose');//act as a mediator b/w db & server
var nodemailer = require('nodemailer');
const axios = require('axios'); // to fetch third party api's
const cors = require('cors');
const Friend = require('./friend');//model import
var fs = require('fs');
const path = require('path');

//mongodb+srv://gaurav_typ:Gaurav@123@cluster0.3fngu.mongodb.net/Friends?retryWrites=true&w=majority
//for using middleware

app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
);


app.use(bodyParser.json());

const connect = async () => { //async function
    try {
        const connection = await mongoose
            .connect(
                'mongodb+srv://gaurav_typ:Gaurav@123@cluster0.3fngu.mongodb.net/Friends?retryWrites=true&w=majority',
                { useNewUrlParser: true, useUnifiedTopology: true }
            )
        console.log("Connected");
    } catch (err) {
        console.log("Not Connected");
    }
}
connect();


const port = 7000;


// using get api method
app.get('/getFilesFromDb', async (req, res) => {
    try {
        const file = await Friend.find();
        if (file.length === 0) {
            return res.status(400).json("No file Found");
        }
        res.status(200).json(file);
    } catch (err) {
        console.log("error", err);
    }
})
// Get By Id From DB
app.get('/getFriendByIdFromDb/:id', async (req, res) => {
    let id = req.params.id;
    const getFriend = await Friend.findById(id);
    res.status(200).json(getFriend);
    console.log(getFriend);
})


// creating new data in DB by Post Req
app.post('/addFile', async (req, res) => {
    try {
        const data = req.body;
        const isExist = await Friend.findOne({ name: data.name })
        console.log(data)
        if (isExist) {
            res.status(400).json("File Already Exists"); //404 bad request
        } else {
            let abc = fs.writeFileSync(`${data.name}.txt`, data.content)
            abc = new Friend(data);
            await abc.save(); //for saving in Db
            res.status(201).json(abc);
        }

    } catch (error) {
        console.log("error", error);
    }
})


// using put/update by using id for any updation
app.put('/update/:id', async (req, res) => {
    const _id = req.params.id;
    const data = req.body;
    try {
        const file = await Friend.findByIdAndUpdate(
            { _id },
            { $set: data },
            { new: true }
        );
        if (!file) {
            res.status(404).json("file not found");
        }
        fs.writeFileSync(`${data.name}.txt`, data.content)
        res.status(200).json(file);
    } catch (error) {
        console.log("error", error);
    }
});


//delete by id 
app.delete('/deleteBYId/:id/:name', async (req, res) => {
    const _id = req.params.id;
    const name = req.params.name;
    try {
        const file = await Friend.findByIdAndDelete(_id);
        if (!file) {
            res.status(404).json("file not exist");
        }console.log(file)
        const filePath = path.resolve(`./${name}.txt`);
        fs.unlinkSync(filePath)
        res.status(200).json("file Deleted");
    } catch (error) {
        console.log("error", error);
    }
});


//sending mail via nodemailer using get req
app.get('/sendmail', async (req, res) => {
    var transporter = await nodemailer.createTransport({
        host: "outmail.abc.co.th",
        secure: false,

        service: 'gmail',
        auth: {
            user: 'singhgaurav1998gs@gmail.com',
            pass: 'megauravbanna'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: 'singhgaurav1998gs@gmail.com',
        to: 'singhbanna1998gs@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
})

//78f7f79609b700854ad81e0ea2550662  Access Key api weatherstack 

//axios.post('',{data},{headers:{
//    
//}})

//weather api
app.get('/getWeather/:place', async (req, res) => {
    const place = req.params.place;
    try {
        const result = await axios.get(
            `http://api.weatherstack.com/current?access_key=78f7f79609b700854ad81e0ea2550662&query=${place}`
        );
        res.status(200).json(result.data);
    } catch (error) {
        console.log("error", error);
    }
})





//port Litsen
app.listen(port, () => {
    console.log(`Port is Accessible on ${port}`);
})