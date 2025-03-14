const express = require('express')
const app = express()

const path = require('path')
const { title } = require('process')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname,"index.db")

let db = null

let task = {}



const initializeDbAndServer = async () => {
    try{
        db = await open({
        filename: dbPath,
        driver: sqlite3.Database
        })

        const createTaskTableQuery = `
        CREATE TABLE IF NOT EXISTS task (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT
        );`;


        await db.run(createTaskTableQuery);


        app.listen(3000,()=>{
            console.log("Server Running at http://localhost:3000/")
        })
        
    }
    catch(e){
        console.log(`DB Error: ${e}`)
    }
}

initializeDbAndServer()

app.use(express.json())

module.exports = app


const titleCheck = async (request,response,next) => {
    // Basic validation to check if 'title' is provided and not empty
    const {title} = request.body;
    if (!title || title.trim() === '') {
        response.status(400);
        response.send({ error: 'Task title is required and cannot be empty.' });
    }
    else{
        next()
    }
}


//CREATE A TASK 

app.post('/tasks/',titleCheck,async(request,response) => {
    const {title , description} = request.body
    const createTaskQuery = `
    INSERT INTO 
        task(title , description)
    VALUES(
        '${title}',
        '${description}'
    )
    `
    const createTask = await db.run(createTaskQuery)
    const uniqueId = createTask.lastId

    response.send({ id: uniqueId, title, description });
    response.status(201)

    //ADDING Post Task To Array
    task[postTask] = createTask
})

//GET ALL TASKS 

app.get('/tasks/',async (request,response) => {
    const getAllTaskQuery = `
    SELECT 
        * 
    FROM
        task
    `

    const getAllTask = await db.all(getAllTaskQuery)
    response.send(getAllTask)
})


//GET A SINGLE TASK

app.get('/tasks/:taskId/',async (request,response) => {
    const {taskId} = request.params
    const selectedTaskQuery = `
    SELECT 
        * 
    FROM
        task
    WHERE
        id = ${taskId}
    `

    const selectedTask = await db.get(selectedTaskQuery)

    if (selectedTask !== undefined){
        response.status(200)
        response.send(selectedTask)
    }
    else{
        response.status(404)
        response.send("Error")
    }
})

//UPDATE TASK

app.put('/tasks/:taskId/',async (request,response) => {
    const {taskId} = request.params
    const {title,description} = request.body
    const updateTaskQuery = `
    UPDATE 
        task
    SET 
        title = '${title}',
        description = '${description}'
    WHERE 
        id = ${taskId}
    `

    const updateTask = await db.run(updateTaskQuery)
    if (updateTask.changes !== 0){
        response.status(200)
        response.send(updateTask)
    }
    else{
        response.status(404)
        response.send("Error")
    }
} )


//DELETE A TASK

app.delete("/tasks/:taskId/",async (request,response) => {
    const {taskId} = request.params 
    const deleteTaskQuery = `
    DELETE FROM 
        task
    WHERE 
        id = ${taskId}
    `

    await db.run(deleteTaskQuery)
    response.send("Task Deleted Successfully")
})