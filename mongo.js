const mongoose = require('mongoose')

var createNewNumber = false

switch (process.argv.length){
    case 0:
    case 1:
    case 2:
        console.log('give password as argument')
        process.exit(1)
    case 3:
        createNewNumber = false
        break
    case 4:
        console.log('need number for new name')
        process.exit(1)
    case 5:
        createNewNumber = true
        break
    default:
        console.log('too many arguments - format: <password> <name> <number>')
        process.exit(1)
}

const password = process.argv[2]
const url =
    `mongodb+srv://rtharrison:${password}@fsocourse.qmg4j9n.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if(createNewNumber){
    const newNumber = new Person({
        name:process.argv[3],
        number:process.argv[4]
    })

    newNumber.save().then(result => {
        console.log('new person saved')
        mongoose.connection.close()
    })
}
else{

    console.log("Phonebook:")
    Person.find({}).then(result => {
        result.forEach(phoneEntry => {
            console.log(`${phoneEntry.name} ${phoneEntry.number}`)
        })
        mongoose.connection.close()
    })

}

