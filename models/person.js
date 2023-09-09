const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const phoneNumberStructure = /^\d{2,3}-\d{1,}$/

const url = process.env.MONGODB_URI

console.log('connecting to MongoDB')

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength: 3,
      required: true
    },
    number: {
      type: String,
      validate:{
        validator: function(v) {
          return phoneNumberStructure.test(v)
        },
        message: props => `${props.value} is not valid. Need xx-... or xxx-...`
      },
      minLength: 8,
      required: true
    }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)