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


/* CREATION OF TASK TABLE FOR DATABASE
 
taskTable = `
 CREATE TABLE task(
     id INTEGER,
     title TEXT,
     description TEXT
 )
`
await db.run(taskTable); */



//CREATE A TASK 

app.post('/tasks/',async(request,response) => {
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

    response.send(createTask)

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

app.put('tasks/:taskId/',async (request,response) => {
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
    if (updateTask !== undefined){
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