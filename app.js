const express = require('express')
const app = express();
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')
const bodyParser = require('body-parser') //line sets up the body-parser middleware to handle incoming JSON data and convert it to a JavaScript object.
const port = process.env.PORT || 2000;

app.use(bodyParser.json());

app.set('view engine', 'ejs'); //view engine
//home page
app.set('views', path.join(__dirname, 'views')); //set the view index directory

// need to create a route to render index page
app.get('/', (req, res) => {
    const data = {
        pageTitle: "Express CRUD App",
        user: null
    }
    res.render('index', data)
})

//post method data receving from user
app.post('/submit', (req, res) => {
    const userData = req.body //data send by client to server in js format 
    console.log(userData);

    fs.readFile('pk.json', 'utf8', (err, data) => {
        if (err) {
            console.error("error in reading data json");
            res.status(500).send(`error in reading data json`)
        } else {
            try {
                const existingData = JSON.parse(data);//parsing will return as array so no need to explixity assign array 
                userData.id = existingData.length + 1;   //assign id numb to object//id assigned
                existingData.push(userData);//now userdata has all setup and need to push in existing array

                //need to write the existing data variable array objects to our data base
                fs.writeFile('pk.json', JSON.stringify(existingData, null, 2), (writeError) => {//existing data cnvrt to stringyfiy format its likwe compressing the wholw data,get it like a single line objects
                    if (writeError) {
                        console.error("error in writing data json");
                        res.status(500).send(`error in writing data json`)
                    } else {
                        console.log("data writed successfully");
                        res.status(200).send(`data recived and saved in data base`)
                    }
                });
            } catch (error) {
                console.error("an error occure", error);
                res.status(500).send(`an error occured : ${error}`)
            }
        }
    })
})

//open- table 
app.get('/open', (req, res) => {
    res.render('open')
})


//get methord to fill the data in table
app.get('/tableBody', (req, res) => {
    fs.readFile('pk.json', 'utf8', (err, data) => {
        if (err) {
            console.error("error in reading data json");
            res.status(500).send(`error in rerading data json`)
        } else {
            try {
                const existingData = JSON.parse(data);
                res.status(200).json(existingData)
            }
            catch (error) {
                console.error("an error occure", error);
                res.status(500).send(`an error occured : ${error}`)
            }
        }
    })
})


//delete method
app.delete('/deleteall/:id', (req, res) => {
    const userId = parseInt(req.params.id);//this will filter my passed id value
    console.log("THE ID NUMBER TO DELETE", userId);
    fs.readFile('pk.json', 'utf8', (err, data) => {
        if (err) {
            console.error("error in reading data json");
            res.status(500).send(`error in reading data json`)
        } else {
            try {
                let existingData = JSON.parse(data) //parsed json data

                //now going to find the index of the object to corresponding id that recieved
                const index = existingData.findIndex(user => user.id === userId)//now it will return the index of that object //if the id not exist it returns the value =-1
                if (index !== -1) {
                    existingData.splice(index, 1)//delete that object
                    console.log("after delt BEFORE PUSH", existingData);
                    existingData = existingData.map((obj, index) => {
                        obj.id = index + 1
                        return obj
                    })


                    //now existing data contain the updated data base,so need to write into data base
                    fs.writeFile('pk.json', JSON.stringify(existingData, null, 2), writeError => {
                        if (writeError) {
                            console.error("error in writing data json");
                            res.status(500).send(`error in writing data json`)
                        } else {
                            console.log("data writed successfully");
                            res.status(200).send(`data recived and saved in data base`)
                        }
                    })
                } else {//if index=-1 came it indicates it cannot find the id
                    console.log(`the given user id ${userId} not found`);
                    res.status(404).send(`user id ${userId} not found`)
                }
            } catch (error) {
                console.error("an error occured", error);
                res.status(500).send(`an error occured ${error}`)
            }
        }
    })
})


//modify
app.get('/edit/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    // Read data from the data.json file
    fs.readFile('pk.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error in reading data.json");
            res.status(500).send(`Error in reading data.json`);
        } else {
            try {
                const existingData = JSON.parse(data);
                const user = existingData.find((user) => user.id === userId);

                if (user) {
                    res.render('index', { user })
                    //    console.log(user);
                } else {
                    console.log(`User with ID ${userId} not found`);
                    res.status(404).send(`User with ID ${userId} not found`);
                }
            } catch (error) {
                console.error("An error occurred", error);
                res.status(500).send(`An error occurred: ${error}`);
            }
        }
    });

})

// Update modified data
app.put(`/editall/:id`, (req, res) => {
    const userId = parseInt(req.params.id, 10);
    console.log("THE ID NUMBER TO MODIFY", userId);
    const recievedData = req.body//got data from request 
    console.log("RECIEVED DATA TO MODIFY" + recievedData);

    //find which object to replaced by id recieved
    fs.readFile('pk.json', (err, data) => {
        if (err) {
            console.error("error in reading data json");
            res.status(500).send(`error in reading data json`)
        } else {
            try {
                const existingData = JSON.parse(data);
                const index = existingData.findIndex((user) => user.id === userId)//if it will find return index if its not return -1 value
                if (index !== -1) {
                    existingData[index] = recievedData;

                    //existing data modified now write in database
                    fs.writeFile('pk.json', JSON.stringify(existingData, null, 2), writeError => {
                        if (writeError) {
                            console.error("error in writing data json");
                            res.status(500).send(`error in writing data json`)
                        } else {
                            console.log("data modified to json data base and writed successfully");
                            res.status(200).send("data modified successfully")
                        }
                    })

                } else {
                    console.log("recievd id index cant find");
                    res.status(404).send(`cant find the intex of id ${userId}`)
                }

            } catch (error) {
                console.error("an error occured", error);
                res.status(500).send(`an error occured due to ${error}`)
            }

        }
    })
})


app.listen(port, () => {
    console.log(`server has started`);
})