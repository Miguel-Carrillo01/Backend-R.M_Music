const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../Model/userModel');
const Producer = require('../Model/producerModel');
const Artist = require('../Model/artistModel');
const Role = require('../Model/rolesModel');
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const moment = require('moment');

const generateRandom = () => {
    const password = crypto.randomBytes(4).toString('hex');
    return password;
};

const registerUser = asyncHandler(async(req, res) => {
    const { name, email, cellphone, password, roles} = req.body

    if (!name || !email || !cellphone || !password ) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if user exists
    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create User
    const user = await User.create({
        name,
        email,
        cellphone,
        password: hashedPassword,
    })

    if(roles){
        const foundRoles = await Role.find({name: {$in: roles}})
        user.roles = foundRoles.map(role => role._id)
    } else {
        const role = await Role.findOne({name: "user"})
        user.roles = [role._id]
    }

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            cellphone: user.cellphone,
            rol: user.roles,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }

    const savedUser = await user.save()

    // console.log(savedUser);
});

const registerProducer = asyncHandler(async(req, res) => {
    const { name, email, cellphone, password, roles} = req.body

    if (!name || !email || !cellphone || !password ) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if user exists
    const userExists = await Producer.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create User
    const userProducer = await Producer.create({
        name,
        email,
        cellphone,
        password: hashedPassword,
    })

    if(roles){
        const foundRoles = await Role.find({name: {$in: roles}})
        userProducer.roles = foundRoles.map(role => role._id)
    } else {
        const role = await Role.findOne({name: "producer"})
        userProducer.roles = [role._id]
    }

    if (userProducer) {
        res.status(201).json({
            _id: userProducer.id,
            name: userProducer.name,
            email: userProducer.email,
            cellphone: userProducer.cellphone,
            rol: userProducer.roles,
            token: generateToken(userProducer._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }

    const savedUser = await userProducer.save()

    // console.log(savedUser);
});

const registerArtist = asyncHandler(async(req, res) => {
    const { name, email, cellphone, country, songs, nameSong, linkSong, password, roles} = req.body

    if (!name || !email || !cellphone || !password || !country || !songs ) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if user exists
    const userExists = await Artist.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create User
    const userArtist = await Artist.create({
        name,
        email,
        cellphone,
        country,
        songs: [
          {nameSong: songs, linkSong}
        ],
        password: hashedPassword,
    })

    if(roles){
        const foundRoles = await Role.find({name: {$in: roles}})
        userArtist.roles = foundRoles.map(role => role._id)
    } else {
        const role = await Role.findOne({name: "artist"})
        userArtist.roles = [role._id]
    }

    if (userArtist) {
        res.status(201).json({
            _id: userArtist.id,
            name: userArtist.name,
            email: userArtist.email,
            cellphone: userArtist.cellphone,
            country: userArtist.country,
            songs: userArtist.songs,
            rol: userArtist.roles,
            token: generateToken(userArtist._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }

    const savedUser = await userArtist.save()

    // console.log(savedUser);
});

const loginUsers = asyncHandler(async(req, res) => {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({email}).populate('roles')
    const userProducer = await Producer.findOne({email}).populate('roles')
    const userArtist = await Artist.findOne({email}).populate('roles')

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.cellphone,
            roles: user.roles.name,
            token: generateToken(user._id),
            msg: "User Registrado"
        })}

    if (userProducer && (await bcrypt.compare(password, userProducer.password))) {
        res.json({
            _id: userProducer.id,
            name: userProducer.name,
            email: userProducer.email,
            cellphone: userProducer.cellphone,
            roles: userProducer.roles.name,
            token: generateToken(userProducer._id),
            msg: "Producer Registrado"
        })
  }

    if (userArtist && (await bcrypt.compare(password, userArtist.password))) {
        res.json({
            _id: userArtist.id,
            name: userArtist.name,
            email: userArtist.email,
            cellphone: userArtist.cellphone,
            roles: userArtist.roles.name,
            token: generateToken(userArtist._id),
            msg: "Artist Registrado"
        })
  }
     else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
    // console.log(user);
    // console.log(userProducer);
    // console.log(userArtist);
});

const recoverPassword = asyncHandler(async(req, res) => {
    const { email } = req.body

    if(!email) res.status(400).send({msg: "Debe ingresar el email"})

    const user = await User.findOne({email});
    const userProducer = await Producer.findOne({email});
    const userArtist = await Artist.findOne({email});

    let dataUsers;
    if(user!==null){
        dataUsers=user
    } else if(userProducer!==null){
        dataUsers=userProducer
    } else if(userArtist!==null) {
        dataUsers=userArtist
    }

        let newPassword = generateRandom();
            if(dataUsers){
                let config = {
                    host: "smtp.gmail.com",
                    port: 587,
                    auth: {
                        user: "carrilobravom@gmail.com", // generated ethereal user
                        pass: "usbfwrwphomxayav", // generated ethereal password
                    },
                }
                let mensaje = {
                from: 'carrilobravom@gmail.com', // sender address
                to: dataUsers.email,
                // list of receivers
                subject: "Recuperacion de contraseña R.M Music", // Subject line
                text: `¿Hola, has olvidado tu contraseña? \n Para ingresar a tu cuenta de nuevo deberas usar esta contraseña: 
                Tu nueva contraseña es: ${newPassword} \n\n Cuado ingreses no olvides cambiar tu contraseña`
            }
            
            const transport = nodemailer.createTransport(config)
            const info = transport.sendMail(mensaje)
            //   console.log(info)
            
            if(newPassword){
                const salt = bcrypt.genSaltSync(10)
                const hashPassword = bcrypt.hashSync(newPassword, salt)
                newPassword = hashPassword
            }
            // console.log(newPassword);

            let roleUser = `${dataUsers.roles}`
    
            if(roleUser.split("")[23]=="3"){
                User.updateOne({email}, { $set: { password: newPassword } }).then(()=>{
                    res.json({
                        msg: "Se cambio la contraseña de User"
                    })
                })
            }else if(roleUser.split("")[23]=="4"){
                Producer.updateOne({email}, { $set: { password: newPassword } }).then(()=>{
                    res.json({
                        msg: "Se cambio la contraseña de Producer"
                    })
                })
            }else if(roleUser.split("")[23]=="5"){
                Artist.updateOne({email}, { $set: { password: newPassword } }).then(()=>{
                    res.json({
                        msg: "Se cambio la contraseña de Artist"
                    })
                })
            }
        } else {
            res.status(400)
            throw new Error('Invalid email')
        }
});

const resetUpdatePassword = asyncHandler( async (req, res) => {
    // const { id } = req.params;
    const { currentPassword, newPassword, email } = req.body;
  
    const user = await User.findOne({ email });
    const userProducer = await Producer.findOne({ email });
    const userArtist = await Artist.findOne({ email });

    let dataUsers;
    if(user!==null){
        dataUsers=user
    } else if(userProducer!==null){
        dataUsers=userProducer
    } else if (userArtist!==null) {
        dataUsers=userArtist
    }

    if (!dataUsers) {
      return res.json({ status: "User Not Exists!" });
    }

// Validacion de la contraseña ingresada con la de la base de datos
    const passwordMatch = await bcrypt.compare(currentPassword, dataUsers.password);
    if (!passwordMatch) {
      return res.json({ status: 'Incorrect Current Password' });
    }
    try {
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      await dataUsers.updateOne(
        {
          $set: {
            password: encryptedPassword,
          },
        }
      );
  
      res.json({ 
        email: email,
        newPassword: newPassword,  
        status: "Verified"
     });

    } catch (error) {
      res.json({ status: "Error"});
      console.log(error);
    }
});

const getRole = asyncHandler(async(req, res) =>{
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    const userProducer = await Producer.findOne({email: email})
    const userArtist = await Artist.findOne({email: email})
    if (user) {
        const {roles} = user;
        res.status(200).json({

          roles,
        //   idUser
        });
      }
      else if (userProducer) {
        const {roles} = userProducer;
        res.status(200).json({
            
          roles,
        //   idUserProducer

        });
    }
      else if (userArtist) {
        const {roles} = userArtist;
        res.status(200).json({
            
          roles,
        //   idUserArtist

        });
        
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
});

const getUser = asyncHandler(async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

  if (user) {
    const { _id, name, email, cellphone, roles} = user;
    res.status(200).json({
      _id,
      name,
      email,
      cellphone,
      roles,
    });
  } else {
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});

const getUserProducer = asyncHandler(async(req, res) => {
  const { email } = req.body;
  const userProducer = await Producer.findOne({ email: email });

if (userProducer) {
  const { _id, name, email, cellphone, roles} = userProducer;
  res.status(200).json({
    _id,
    name,
    email,
    cellphone,
    roles,
  });
} else {
  res.status(404).json({ message: 'Usuario no encontrado' });
}
});

const getUserArtist = asyncHandler(async(req, res) => {
  const { email } = req.body;
  const userArtist = await Artist.findOne({ email: email });

if (userArtist) {
  const { _id, name, email, cellphone, roles} = userArtist;
  res.status(200).json({
    _id,
    name,
    email,
    cellphone,
    roles,
  });
} else {
  res.status(404).json({ message: 'Usuario no encontrado' });
}
});

// const getAllParking = asyncHandler(async(req, res) => {
//     UserParking.find().then((data, err) => {
//         if (err) {
//           console.error(err);
//           res.status(500).send('Error de servidor');
//         } else {
//           res.json(data);
//         }
//       });
// });

const updateUser = asyncHandler(async(req, res) => {
    const { _id } = req.params;
    const { name, cellphone } = req.body;

    try {
      const user = await User.findOne(_id);
      if(user){
        const newInfo ={
          name: name,
          cellphone: cellphone,
        }
        await User.updateOne({id: _id}, {$set: newInfo})
        res.status(200).send('Datos Actualizados Correctamente');
      }
    } catch (err) {
      res.status(500).json({ err: 'Error al actualizar los datos del usuario' });
    }
});

const updateUserProducer = asyncHandler(async(req, res) => {
  const { _id } = req.params;
  const { name, cellphone } = req.body;

  try {
    const user = await User.findOne(_id);
    if(user){
      const newInfo ={
        name: name,
        cellphone: cellphone,
      }
      await User.updateOne({id: _id}, {$set: newInfo})
      res.status(200).send('Datos Actualizados Correctamente');
    }
  } catch (err) {
    res.status(500).json({ err: 'Error al actualizar los datos del usuario' });
  }
});

const updateUserArtist = asyncHandler(async(req, res) => {
  const { _id } = req.params;
  const { name, cellphone } = req.body;

  try {
    const user = await User.findOne(_id);
    if(user){
      const newInfo ={
        name: name,
        cellphone: cellphone,
      }
      await User.updateOne({id: _id}, {$set: newInfo})
      res.status(200).send('Datos Actualizados Correctamente');
    }
  } catch (err) {
    res.status(500).json({ err: 'Error al actualizar los datos del usuario' });
  }
});

const search = asyncHandler(async(req, res) => {
    const searchTerm = req.body.searchTerm;

    try {
      // Utiliza una expresión regular para hacer coincidir la dirección con el término de búsqueda
      const regex = new RegExp(searchTerm, 'i');
  
      // Realiza la búsqueda filtrando por la dirección
      const results = await UserParking.find({ address: regex });
  
      // Envía los resultados de la búsqueda al cliente
      res.json(results);
    } catch (error) {
      console.log('Error en la búsqueda:', error);
      res.status(500).send('Error en la búsqueda');
    }
});

const getBooking = asyncHandler(async(req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reservas' });
      }
});

const getBookingById = asyncHandler(async(req,res) =>{
    const { idUser } = req.params;
    const bookings = await Booking.find({ idUser: idUser });

    if (bookings.length > 0) {
        const bookingData = bookings.map((booking) => {
          const { name, nitParking, dateStartBooking, dateEndBooking } = booking;
          return {
            name,
            nitParking,
            dateStartBooking,
            dateEndBooking,
          };
        });
    
        res.status(200).json(bookingData);
      } else {
        res.status(404).json({ message: 'Este usuario no tiene reservas' });
      }
});

const getBookingByNitParking = asyncHandler(async(req,res) =>{
    const { nitParking } = req.params;
    const bookings = await Booking.find({ nitParking: nitParking });

    if (bookings.length > 0) {
        const bookingData = bookings.map((booking) => {
          const { name, userName, cellphone, nitParking, dateStartBooking, dateEndBooking } = booking;
          return {
            name,
            userName,
            cellphone,
            nitParking,
            dateStartBooking,
            dateEndBooking,
          };
        });
    
        res.status(200).json(bookingData);
      } else {
        res.status(404).json({ message: 'Este parqueadero no tiene reservas' });
      }
});

const createBooking = asyncHandler(async(req, res) => {
    try {
        const { name, nitParking, idUser, userName, cellphone, dateStartBooking, duration } = req.body;
        const formattedStartBooking = moment(dateStartBooking).format('YYYY-MM-DD HH:mm:ss');
        const formattedEndBooking = moment(dateStartBooking).add(duration, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    // Calcular fecha de finalización sumando la duración

        // Verificacion reserva activa dentro del tiempo
        const existingBooking = await Booking.findOne({
          idUser,
          $or: [
            {
              dateStartBooking: { $lte: formattedStartBooking }, // La reserva existente comienza antes o al mismo tiempo que la nueva reserva
              dateEndBooking: { $gt: formattedStartBooking } // La reserva existente termina después de que comience la nueva reserva
            },
            {
              dateStartBooking: { $lt: formattedEndBooking }, // La reserva existente comienza antes de que termine la nueva reserva
              dateEndBooking: { $gte: formattedEndBooking } // La reserva existente termina al mismo tiempo o después de que termine la nueva reserva
            },
            {
              dateStartBooking: { $gte: formattedStartBooking }, // La reserva existente comienza después de que comience la nueva reserva
              dateEndBooking: { $lte: formattedEndBooking } // La reserva existente termina antes de que termine la nueva reserva
            }
          ]
        });

        if (existingBooking) {
          return res.status(400).json({ error: 'Ya tienes una reserva activa' });
        }

        const userParking = await UserParking.findOne({ nit: nitParking });
        if (!userParking) {
          return res.status(400).json({ error: 'No se encontró el parqueadero' });
        }
    
        let availableSpace;
        let spaceBooking;
        for (const space of userParking.capacity) {
          if (space.state === 'available') {
            space.state = 'reserved';
            availableSpace = space;
            spaceBooking = space.space
            break;
          }
        }
    
        if (!availableSpace) {
          return res.status(400).json({ error: 'No hay espacios disponibles para reservar' });
        }
    
        userParking.save();
    
    
        const booking = new Booking({ name,  nitParking, spaceBooking, idUser, userName, cellphone, dateStartBooking: formattedStartBooking, dateEndBooking: formattedEndBooking });
        await booking.save();
    
        res.json({ mensaje: 'Reserva creada exitosamente' });
      } catch (error) {
        res.status(500).json({ error: 'Error al crear la reserva' });
      }
});

const getUserSpaces = asyncHandler(async(req,res) =>{
    const { idUserParking } = req.params;
    const userParking = await UserParking.findOne({ idUserParking: idUserParking });

    if (userParking) {
      const userSpaces = userParking.capacity;

      // `userSpaces` es un arreglo que contiene los espacios del usuario de parqueadero
      res.status(200).json(userSpaces);
    } else {
      res.status(404).json({ message: 'Este usuario no tiene Espacios' });
  }
});

const updateSpaceById = asyncHandler(async(req, res) => {
  const { _id, idUserParking } = req.params;
  const { state } = req.body;

  UserParking.findOneAndUpdate(
    { idUserParking: idUserParking, 'capacity._id': _id}, // Filtra por el ID del usuario y el ID del espacio
    { $set: { 'capacity.$.state': state } }, // Actualiza el estado del espacio
    { new: true }
  )
    .then(updatedUser => {
      if (!updatedUser) {
        res.status(404).json({ error: 'Usuario o espacio no encontrado' });
      } else {
        res.json(updatedUser);
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al actualizar el estado del espacio' });
    });
});

const addSongsToArtist = asyncHandler(async (req, res) => {
  const { _id } = req.params; // Obtener el ID del usuario desde los parámetros de la solicitud
  const { nameSong, linkSong } = req.body; // Obtener los datos del vehículo del cuerpo de la solicitud

  try {
    // Buscar al usuario por su ID
    const userArtist = await Artist.findOne(_id);

    if (!userArtist) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Crear un nuevo objeto de vehículo
    const newSong = {
      nameSong,
      linkSong
    };

    // Agregar el vehículo al arreglo de vehículos del usuario
    userArtist.songs.push(newSong);

    // Guardar los cambios en el usuario
    await userArtist.save();

    res.status(201).json({ message: 'Song add', songs: newSong });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const updateSongsArtist = asyncHandler(async (req, res) => {
  const { _id, songsId } = req.params; // Obtener los IDs del usuario y del vehículo de los parámetros de la URL
  const { nameSong, linkSong } = req.body; // Obtener los datos actualizados del vehículo del cuerpo de la solicitud

  try {
    // Buscar al usuario por su ID
    const userArtist = await Artist.findOne(_id);

    if (!userArtist) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar el vehículo por su ID en el arreglo de vehículos del usuario
    const song = userArtist.songs.id(songsId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Actualizar los datos del vehículo
    song.nameSong = nameSong;
    song.linkSong = linkSong;

    // Guardar los cambios en el usuario
    await userArtist.save();

    res.status(200).json({ message: 'Song updated', song });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const deleteSongsArtist = asyncHandler(async (req, res) => {
  try {
    const { _id, songId } = req.params;

    const userArtist = await Artist.findOne(_id);

    if (!userArtist) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Filtrar el vehículo a eliminar
    userArtist.songs = userArtist.songs.filter((songs) => songs._id != songId);

    await userArtist.save();

    res.json({ message: 'Canción eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la canción' });
    console.log(error);
  }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '90d', 
    })
}

module.exports = {
    registerUser,
    registerProducer,
    registerArtist,
    loginUsers,
    updateUser,
    updateUserProducer,
    updateUserArtist,
    getRole,
    getUser,
    getUserProducer,
    getUserArtist,
    recoverPassword,
    resetUpdatePassword,
    // getAllParking,
    search,
    getBooking,
    getBookingById,
    getBookingByNitParking,
    createBooking,
    getUserSpaces,
    updateSpaceById,
    addSongsToArtist,
    updateSongsArtist,
    deleteSongsArtist
}