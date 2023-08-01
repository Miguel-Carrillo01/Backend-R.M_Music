const mongoose = require('mongoose');

const artistSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add a email'],
        unique: true
    },
    cellphone: {
        type: String,
        required: [true, 'Please add a cellphone'],
        unique: true
    },
    country: {
        type: String,
        required: [true, 'Please add a country'],
    },
    songs: {
        type: [{
            nameSong: {
                type: String,
                required: [true, 'Please add a name song']
            },
            linkSong: {
                type: String,
                required: [true, 'Please add a link song']
            }
        }],
        default: undefined // Para que el campo esté vacío por defecto
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    roles: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role", 
    },
},
{
    timestamps: true,
    versionKey: false,
})
    
module.exports = mongoose.model('Artist', artistSchema);